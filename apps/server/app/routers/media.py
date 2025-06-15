"""
メディア関連の API エンドポイント
ツイートに添付されたメディアファイルの処理・管理
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.constants import API_PREFIX, MEDIA_BUCKET_NAME
from app.utils.media_downloader import (
    process_pending_media_batch,
    process_single_media,
    retry_failed_media_batch,
)
from app.utils.s3_client import (
    get_media_public_url,
    initialize_media_bucket,
    media_file_exists,
    s3_client,
)

router = APIRouter(prefix=f'{API_PREFIX}/media', tags=['media'])


class MediaProcessResponse(BaseModel):
    """メディア処理レスポンス"""

    success: bool
    message: str
    processed_count: int = 0


class MediaUrlResponse(BaseModel):
    """メディア URL レスポンス"""

    success: bool
    media_key: str
    url: str | None = None
    message: str = ''
    exists: bool = False


class BucketInitResponse(BaseModel):
    """バケット初期化レスポンス"""

    success: bool
    message: str


class BucketPolicyResponse(BaseModel):
    """バケットポリシー確認レスポンス"""

    success: bool
    policy: str | None = None
    message: str


@router.post('/process/{media_id}', response_model=MediaProcessResponse)
async def ProcessSingleMediaAPI(media_id: int) -> MediaProcessResponse:
    """
    指定されたメディアファイルを処理（ダウンロード・MinIO保存）
    """
    try:
        success = await process_single_media(media_id)
        return MediaProcessResponse(
            success=success,
            message=f'Media {media_id} processed successfully'
            if success
            else f'Failed to process media {media_id}',
            processed_count=1 if success else 0,
        )
    except Exception as ex:
        raise HTTPException(
            status_code=500, detail=f'Error processing media {media_id}: {ex!s}'
        )


@router.post('/process/pending', response_model=MediaProcessResponse)
async def ProcessPendingMediaAPI(limit: int = 10) -> MediaProcessResponse:
    """
    未処理のメディアファイルを一括処理
    """
    try:
        processed_count = await process_pending_media_batch(limit)
        return MediaProcessResponse(
            success=True,
            message=f'Processed {processed_count} media files',
            processed_count=processed_count,
        )
    except Exception as ex:
        raise HTTPException(
            status_code=500, detail=f'Error processing pending media: {ex!s}'
        )


@router.post('/retry/failed', response_model=MediaProcessResponse)
async def RetryFailedMediaAPI(
    max_attempts: int = 3, limit: int = 10
) -> MediaProcessResponse:
    """
    失敗したメディアファイルのリトライ処理
    """
    try:
        processed_count = await retry_failed_media_batch(max_attempts, limit)
        return MediaProcessResponse(
            success=True,
            message=f'Retried {processed_count} failed media files',
            processed_count=processed_count,
        )
    except Exception as ex:
        raise HTTPException(
            status_code=500, detail=f'Error retrying failed media: {ex!s}'
        )


@router.get('/url/{media_key}', response_model=MediaUrlResponse)
async def GetMediaUrlAPI(media_key: str) -> MediaUrlResponse:
    """
    メディアファイルのパブリック URL を取得
    Twitterライクなタイムラインでのメディア表示用
    """
    try:
        # ファイルの存在確認
        exists = await media_file_exists(media_key)

        if exists:
            # パブリック URL を生成（直接アクセス可能）
            url = get_media_public_url(media_key)
            return MediaUrlResponse(
                success=True,
                media_key=media_key,
                url=url,
                message='Media URL generated',
                exists=True,
            )
        else:
            return MediaUrlResponse(
                success=False,
                media_key=media_key,
                message='Media file does not exist',
                exists=False,
            )
    except Exception as ex:
        raise HTTPException(
            status_code=500,
            detail=f'Error getting URL for media {media_key}: {ex!s}',
        )


@router.post('/initialize-bucket', response_model=BucketInitResponse)
async def InitializeBucketAPI() -> BucketInitResponse:
    """
    メディア保存用バケットを初期化（ポリシー設定を含む）
    """
    try:
        success = await initialize_media_bucket()
        return BucketInitResponse(
            success=success,
            message='Media bucket initialized successfully'
            if success
            else 'Failed to initialize media bucket',
        )
    except Exception as ex:
        raise HTTPException(
            status_code=500, detail=f'Error initializing bucket: {ex!s}'
        )


@router.get('/bucket-policy', response_model=BucketPolicyResponse)
async def GetBucketPolicyAPI() -> BucketPolicyResponse:
    """
    メディアバケットの現在のポリシーを確認
    """
    try:
        policy_response = s3_client.s3_client.get_bucket_policy(
            Bucket=MEDIA_BUCKET_NAME
        )
        return BucketPolicyResponse(
            success=True,
            policy=policy_response['Policy'],
            message='Bucket policy retrieved successfully',
        )
    except Exception as ex:
        return BucketPolicyResponse(
            success=False,
            message=f'Error getting bucket policy: {ex!s}',
        )
