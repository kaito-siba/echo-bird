from tortoise.fields import (
    CASCADE,
    BigIntField,
    BooleanField,
    CharField,
    ForeignKeyField,
    IntField,
    TextField,
)
from tortoise.models import Model

from app.constants import (
    DEFAULT_COUNT,
    DEFAULT_IS_ACTIVE,
    DEFAULT_IS_LOCKED,
    DEFAULT_IS_LOGGED_IN,
    DEFAULT_IS_SUSPENDED,
    EMAIL_MAX_LENGTH,
    TABLE_TWITTER_ACCOUNTS,
    TOKEN_MAX_LENGTH,
    TWITTER_ACCOUNT_STATUS_ACTIVE,
    TWITTER_ACCOUNT_STATUS_SUSPENDED,
    TWITTER_ID_LENGTH,
    URL_MAX_LENGTH,
    USERNAME_MAX_LENGTH,
)


class TwitterAccount(Model):
    """
    認証用 Twitter アカウント情報を管理するモデル
    twikit を使用した認証情報を保存
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField(
        'models.User', related_name='twitter_accounts', on_delete=CASCADE
    )  # EchoBird ユーザー

    # twikit 認証情報（どちらか一方でログイン）
    email = CharField(
        max_length=EMAIL_MAX_LENGTH, null=True
    )  # ログイン用メールアドレス
    screen_name = CharField(
        max_length=USERNAME_MAX_LENGTH, null=True
    )  # ログイン用スクリーンネーム（@なし）
    password = CharField(max_length=TOKEN_MAX_LENGTH)  # 暗号化されたパスワード

    # セッション情報
    cookies = TextField(null=True)  # twikit のセッション Cookie (JSON 形式で保存)
    auth_token = CharField(max_length=TOKEN_MAX_LENGTH, null=True)  # 認証トークン
    ct0 = CharField(max_length=TOKEN_MAX_LENGTH, null=True)  # CSRF トークン

    # アカウント情報（twikit から取得）
    twitter_user_id = CharField(
        max_length=TWITTER_ID_LENGTH, null=True, unique=True
    )  # Twitter 側のユーザー ID
    display_name = CharField(max_length=USERNAME_MAX_LENGTH, null=True)  # 表示名
    profile_image_url = CharField(
        max_length=URL_MAX_LENGTH, null=True
    )  # プロフィール画像 URL

    # 状態管理
    is_active = BooleanField(
        default=DEFAULT_IS_ACTIVE
    )  # アカウントがアクティブかどうか
    is_logged_in = BooleanField(default=DEFAULT_IS_LOGGED_IN)  # 現在ログイン中かどうか
    last_login_at = IntField(null=True)  # 最後にログインした日時（Unix timestamp）

    # エラー・制限管理
    is_suspended = BooleanField(
        default=DEFAULT_IS_SUSPENDED
    )  # Twitter 側で凍結されているかどうか
    is_locked = BooleanField(
        default=DEFAULT_IS_LOCKED
    )  # アカウントがロックされているかどうか
    rate_limit_exceeded_at = IntField(
        null=True
    )  # レート制限に達した日時（Unix timestamp）
    last_error = TextField(null=True)  # 最後に発生したエラー
    error_count = IntField(default=DEFAULT_COUNT)  # エラー発生回数

    created_at = IntField()  # レコード作成日時（Unix timestamp）
    updated_at = IntField()  # レコード更新日時（Unix timestamp）

    class Meta:
        table = TABLE_TWITTER_ACCOUNTS

    async def save(self, *args, **kwargs):
        """保存時に updated_at を自動更新"""
        import time

        if not self.created_at:
            self.created_at = int(time.time())
        self.updated_at = int(time.time())
        await super().save(*args, **kwargs)

    def __str__(self):
        login_identifier = self.screen_name or self.email or 'Unknown'
        status = (
            TWITTER_ACCOUNT_STATUS_ACTIVE
            if self.is_active and not self.is_suspended
            else TWITTER_ACCOUNT_STATUS_SUSPENDED
        )
        return f'{login_identifier} ({status})'
