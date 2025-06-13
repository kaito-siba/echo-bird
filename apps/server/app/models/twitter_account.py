from tortoise.fields import (
    CASCADE,
    BigIntField,
    BooleanField,
    CharField,
    DatetimeField,
    ForeignKeyField,
    IntField,
    TextField,
)
from tortoise.models import Model


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
    email = CharField(max_length=255, null=True)  # ログイン用メールアドレス
    screen_name = CharField(
        max_length=255, null=True
    )  # ログイン用スクリーンネーム（@なし）
    password = CharField(max_length=500)  # 暗号化されたパスワード

    # セッション情報
    cookies = TextField(null=True)  # twikit のセッション Cookie (JSON 形式で保存)
    auth_token = CharField(max_length=500, null=True)  # 認証トークン
    ct0 = CharField(max_length=500, null=True)  # CSRF トークン

    # アカウント情報（twikit から取得）
    twitter_user_id = CharField(
        max_length=50, null=True, unique=True
    )  # Twitter 側のユーザー ID
    display_name = CharField(max_length=255, null=True)  # 表示名
    profile_image_url = CharField(max_length=500, null=True)  # プロフィール画像 URL

    # 状態管理
    is_active = BooleanField(default=True)  # アカウントがアクティブかどうか
    is_logged_in = BooleanField(default=False)  # 現在ログイン中かどうか
    last_login_at = DatetimeField(null=True)  # 最後にログインした日時

    # エラー・制限管理
    is_suspended = BooleanField(default=False)  # Twitter 側で凍結されているかどうか
    is_locked = BooleanField(default=False)  # アカウントがロックされているかどうか
    rate_limit_exceeded_at = DatetimeField(null=True)  # レート制限に達した日時
    last_error = TextField(null=True)  # 最後に発生したエラー
    error_count = IntField(default=0)  # エラー発生回数

    created_at = DatetimeField(auto_now_add=True)  # レコード作成日時
    updated_at = DatetimeField(auto_now=True)  # レコード更新日時

    class Meta:
        table = 'twitter_accounts'

    def __str__(self):
        login_identifier = self.screen_name or self.email or 'Unknown'
        status = 'Active' if self.is_active and not self.is_suspended else 'Suspended'
        return f'{login_identifier} ({status})'
