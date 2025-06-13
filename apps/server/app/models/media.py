from typing import ClassVar

from tortoise.fields import (
    CASCADE,
    BigIntField,
    CharField,
    DatetimeField,
    ForeignKeyField,
    IntField,
    JSONField,
    TextField,
)
from tortoise.models import Model


class Media(Model):
    """
    ツイートに添付されたメディア（画像・動画・GIF）を管理するモデル
    twikit の Media オブジェクトから取得した情報を保存
    """

    id = BigIntField(primary_key=True)
    tweet = ForeignKeyField(
        'models.Tweet', related_name='media_items', on_delete=CASCADE
    )  # 所属するツイート

    # メディア基本情報
    media_key = CharField(
        max_length=100, unique=True
    )  # メディアキー (twikit: Media.media_key)
    media_type = CharField(
        max_length=20
    )  # メディアタイプ: photo, video, animated_gif (twikit: Media.type)

    # URL 情報
    media_url = CharField(
        max_length=500, null=True
    )  # メディア URL (twikit: Media.media_url_https)
    display_url = CharField(
        max_length=500, null=True
    )  # 表示用 URL (twikit: Media.display_url)
    expanded_url = CharField(
        max_length=500, null=True
    )  # 展開された URL (twikit: Media.expanded_url)

    # 画像情報
    width = IntField(null=True)  # 幅 (twikit: Media.width)
    height = IntField(null=True)  # 高さ (twikit: Media.height)

    # 動画・GIF 情報
    duration_ms = IntField(null=True)  # 再生時間（ミリ秒）(twikit: Media.duration_ms)
    preview_image_url = CharField(
        max_length=500, null=True
    )  # サムネイル URL (twikit: Media.preview_image_url)

    # 動画のバリアント情報（解像度別の URL など）
    variants = JSONField(null=True)  # 動画のバリアント情報 (twikit: Media.variants)

    # メタデータ
    alt_text = TextField(null=True)  # 代替テキスト (twikit: Media.alt_text)
    additional_media_info = JSONField(null=True)  # 追加のメディア情報

    # ローカル保存情報
    local_path = CharField(max_length=500, null=True)  # ローカルに保存した場合のパス
    file_size = IntField(null=True)  # ファイルサイズ（バイト）
    is_downloaded = CharField(
        max_length=20, default='pending'
    )  # ダウンロード状態: pending, downloading, completed, failed
    download_attempts = IntField(default=0)  # ダウンロード試行回数
    downloaded_at = DatetimeField(null=True)  # ダウンロード完了日時

    created_at = DatetimeField(auto_now_add=True)  # レコード作成日時
    updated_at = DatetimeField(auto_now=True)  # レコード更新日時

    class Meta:
        table = 'media'
        indexes: ClassVar = [
            ('tweet', 'media_type'),  # ツイート別・タイプ別の検索用
            ('is_downloaded',),  # ダウンロード状態での絞り込み用
        ]

    def __str__(self):
        return f'{self.media_type}: {self.media_key}'
