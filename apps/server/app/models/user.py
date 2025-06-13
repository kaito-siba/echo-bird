from tortoise.fields import (
    BigIntField,
    BooleanField,
    CharField,
    DatetimeField,
)
from tortoise.models import Model

from app.constants import (
    DEFAULT_IS_ACTIVE,
    DEFAULT_IS_ADMIN,
    PASSWORD_HASH_LENGTH,
    TABLE_USERS,
    USERNAME_MAX_LENGTH,
)


class User(Model):
    """
    EchoBird アプリケーションのユーザー情報を管理するモデル
    """

    id = BigIntField(primary_key=True)
    username = CharField(
        max_length=USERNAME_MAX_LENGTH, unique=True
    )  # EchoBird 内でのユーザー名
    password_hash = CharField(max_length=PASSWORD_HASH_LENGTH)  # パスワードハッシュ
    is_active = BooleanField(default=DEFAULT_IS_ACTIVE)  # アクティブ状態
    is_admin = BooleanField(default=DEFAULT_IS_ADMIN)  # 管理者権限
    created_at = DatetimeField(auto_now_add=True)  # レコード作成日時
    updated_at = DatetimeField(auto_now=True)  # レコード更新日時

    class Meta:
        table = TABLE_USERS

    def __str__(self):
        return self.username
