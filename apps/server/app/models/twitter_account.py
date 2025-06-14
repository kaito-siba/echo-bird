from tortoise.fields import (
    BigIntField,
    BooleanField,
    CharField,
    ForeignKeyField,
    IntField,
    TextField,
)
from tortoise.models import Model

from app.constants import (
    DEFAULT_IS_ACTIVE,
    FIELD_LENGTH_LARGE,
    TABLE_TWITTER_ACCOUNTS,
    TWITTER_ACCOUNT_STATUS_ACTIVE,
    TWITTER_ID_LENGTH,
    USERNAME_MAX_LENGTH,
)


class TwitterAccount(Model):
    """
    Twitter アカウント情報を管理するモデル

    twikit を使用して認証されたTwitterアカウントの情報を保存し、
    EchoBird のユーザーと関連付けます。
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField(
        'models.User', related_name='twitter_accounts'
    )  # EchoBird ユーザーとの関連

    # Twitter アカウント基本情報
    twitter_id = CharField(
        max_length=TWITTER_ID_LENGTH, unique=True
    )  # Twitter ユーザーID
    username = CharField(max_length=USERNAME_MAX_LENGTH)  # Twitter ユーザー名（@なし）
    display_name = CharField(max_length=USERNAME_MAX_LENGTH)  # 表示名

    # 認証情報（暗号化して保存）
    email = CharField(
        max_length=USERNAME_MAX_LENGTH, null=True
    )  # Twitterアカウントのメールアドレス
    password_encrypted = TextField(null=True)  # 暗号化されたパスワード

    # セッション管理
    cookies_data = TextField(null=True)  # twikit のクッキー情報（JSON形式）

    # アカウント状態
    is_active = BooleanField(default=DEFAULT_IS_ACTIVE)  # アクティブ状態
    status = CharField(
        max_length=50, default=TWITTER_ACCOUNT_STATUS_ACTIVE
    )  # アカウントステータス

    # プロフィール情報
    profile_image_url = CharField(
        max_length=FIELD_LENGTH_LARGE, null=True
    )  # プロフィール画像URL
    bio = TextField(null=True)  # プロフィール説明
    followers_count = IntField(default=0)  # フォロワー数
    following_count = IntField(default=0)  # フォロー数

    # タイムスタンプ
    created_at = IntField()  # レコード作成日時（Unix timestamp）
    updated_at = IntField()  # レコード更新日時（Unix timestamp）
    last_login_at = IntField(null=True)  # 最終ログイン日時（Unix timestamp）

    class Meta:
        table = TABLE_TWITTER_ACCOUNTS

    def __str__(self):
        return f'@{self.username} ({self.display_name})'

    async def save(self, *args, **kwargs):
        """保存時に updated_at を自動更新"""
        import time

        if not self.created_at:
            self.created_at = int(time.time())
        self.updated_at = int(time.time())
        await super().save(*args, **kwargs)
