"""
ツイートメディアファイルのダウンロード・MinIO保存機能
twikit から取得したメディア URL からファイルをダウンロードし、MinIO に保存する
"""

import time

import httpx
from tortoise.exceptions import DoesNotExist

from app.constants import (
    MEDIA_STATUS_COMPLETED,
    MEDIA_STATUS_DOWNLOADING,
    MEDIA_STATUS_FAILED,
    MEDIA_STATUS_PENDING,
)
from app.models.media import Media
from app.utils.s3_client import media_file_exists, upload_media_file


class MediaDownloader:
    """メディアファイルのダウンロード・保存を管理するクラス"""

    def __init__(self):
        """HTTP クライアントを初期化"""
        self.http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),  # 30秒のタイムアウト
            limits=httpx.Limits(max_connections=10),
        )

    async def close(self):
        """HTTP クライアントを閉じる"""
        await self.http_client.aclose()

    async def download_media_file(self, url: str) -> bytes | None:
        """指定されたURLからメディアファイルをダウンロード"""
        try:
            response = await self.http_client.get(url)
            response.raise_for_status()
            return response.content
        except httpx.HTTPError as ex:
            print(f'Failed to download media from {url}: {ex}')
            return None
        except Exception as ex:
            print(f'Unexpected error downloading media from {url}: {ex}')
            return None

    def get_content_type_from_media_type(self, media_type: str) -> str | None:
        """メディアタイプからコンテンツタイプを推定"""
        content_type_map = {
            'photo': 'image/jpeg',
            'video': 'video/mp4',
            'animated_gif': 'image/gif',
        }
        return content_type_map.get(media_type)

    async def process_media(self, media_id: int) -> bool:
        """指定されたメディアレコードを処理（ダウンロード・保存）"""
        try:
            # メディアレコードを取得
            media = await Media.get(id=media_id)

            # 既にダウンロード済みの場合はスキップ
            if media.is_downloaded == MEDIA_STATUS_COMPLETED:
                print(f'Media {media.media_key} is already downloaded')
                return True

            # MinIO に既に存在する場合はスキップ
            if await media_file_exists(media.media_key):
                print(f'Media {media.media_key} already exists in MinIO')
                await self._update_media_status(media, MEDIA_STATUS_COMPLETED)
                return True

            # ダウンロード状態を更新
            await self._update_media_status(media, MEDIA_STATUS_DOWNLOADING)

            # メディア URL が存在しない場合はエラー
            if not media.media_url:
                print(f'Media {media.media_key} has no media_url')
                await self._update_media_status(media, MEDIA_STATUS_FAILED)
                return False

            # ファイルをダウンロード
            file_data = await self.download_media_file(media.media_url)
            if not file_data:
                await self._update_media_status(media, MEDIA_STATUS_FAILED)
                return False

            # コンテンツタイプを推定
            content_type = self.get_content_type_from_media_type(media.media_type)

            # MinIO にアップロード
            upload_success = await upload_media_file(
                media.media_key, file_data, content_type
            )

            if upload_success:
                # 成功時の状態更新
                media.file_size = len(file_data)
                media.downloaded_at = int(time.time())
                await self._update_media_status(media, MEDIA_STATUS_COMPLETED)
                print(f'Successfully uploaded media {media.media_key} to MinIO')
                return True
            else:
                # 失敗時の状態更新
                await self._update_media_status(media, MEDIA_STATUS_FAILED)
                return False

        except DoesNotExist:
            print(f'Media with id {media_id} does not exist')
            return False
        except Exception as ex:
            print(f'Unexpected error processing media {media_id}: {ex}')
            try:
                await self._update_media_status(media, MEDIA_STATUS_FAILED)
            except:
                pass
            return False

    async def _update_media_status(self, media: Media, status: str):
        """メディアレコードのダウンロード状態を更新"""
        media.is_downloaded = status
        media.download_attempts += 1
        await media.save()

    async def process_pending_media(self, limit: int = 10) -> int:
        """未処理のメディアを一括処理"""
        # 未処理のメディアを取得
        pending_media = await Media.filter(is_downloaded=MEDIA_STATUS_PENDING).limit(
            limit
        )

        success_count = 0
        for media in pending_media:
            success = await self.process_media(media.id)
            if success:
                success_count += 1

        print(f'Processed {len(pending_media)} media files, {success_count} successful')
        return success_count

    async def retry_failed_media(self, max_attempts: int = 3, limit: int = 10) -> int:
        """失敗したメディアのリトライ処理"""
        # 失敗したメディアで試行回数が上限以下のものを取得
        failed_media = await Media.filter(
            is_downloaded=MEDIA_STATUS_FAILED, download_attempts__lt=max_attempts
        ).limit(limit)

        success_count = 0
        for media in failed_media:
            # 状態をリセットしてリトライ
            media.is_downloaded = MEDIA_STATUS_PENDING
            await media.save()

            success = await self.process_media(media.id)
            if success:
                success_count += 1

        print(
            f'Retried {len(failed_media)} failed media files, {success_count} successful'
        )
        return success_count


# グローバル メディアダウンローダーインスタンス
media_downloader = MediaDownloader()


async def process_single_media(media_id: int) -> bool:
    """単一のメディアファイルを処理"""
    return await media_downloader.process_media(media_id)


async def process_pending_media_batch(limit: int = 10) -> int:
    """未処理メディアの一括処理"""
    return await media_downloader.process_pending_media(limit)


async def retry_failed_media_batch(max_attempts: int = 3, limit: int = 10) -> int:
    """失敗したメディアのリトライ処理"""
    return await media_downloader.retry_failed_media(max_attempts, limit)
