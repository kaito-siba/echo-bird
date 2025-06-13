from tortoise.fields import (
    BigIntField,
    BooleanField,
    CharField,
    DatetimeField,
)
from tortoise.models import Model


class User(Model):
    """
    EchoBird アプリケーションのユーザー情報を管理するモデル
    """

    id = BigIntField(primary_key=True)
    username = CharField(max_length=255, unique=True)  # EchoBird 内でのユーザー名
    password_hash = CharField(max_length=255)  # パスワードハッシュ
    is_active = BooleanField(default=True)  # アクティブ状態
    is_admin = BooleanField(default=False)  # 管理者権限
    created_at = DatetimeField(auto_now_add=True)  # レコード作成日時
    updated_at = DatetimeField(auto_now=True)  # レコード更新日時

    class Meta:
        table = 'users'

    def __str__(self):
        return self.username
