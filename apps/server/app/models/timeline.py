from tortoise.fields import (
    CASCADE,
    BigIntField,
    BooleanField,
    CharField,
    ForeignKeyField,
    IntField,
    ManyToManyField,
    TextField,
)
from tortoise.models import Model

from app.constants import (
    DEFAULT_IS_ACTIVE,
    FIELD_LENGTH_MEDIUM,
    TABLE_TIMELINES,
)


class Timeline(Model):
    """
    ユーザーがカスタム作成するタイムライン（フィード）を管理するモデル
    複数のターゲットアカウントを組み合わせてカスタムタイムラインを作成可能
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField(
        'models.User', related_name='timelines', on_delete=CASCADE
    )  # タイムラインを作成したユーザー

    # 基本情報
    name = CharField(max_length=FIELD_LENGTH_MEDIUM)  # タイムライン名
    description = TextField(null=True)  # タイムラインの説明

    # 状態管理
    is_active = BooleanField(default=DEFAULT_IS_ACTIVE)  # アクティブ状態
    is_default = BooleanField(default=False)  # デフォルトタイムラインかどうか

    # ターゲットアカウントとの関連（多対多）
    target_accounts = ManyToManyField(
        'models.TargetAccount',
        related_name='timelines',
        through='timeline_target_accounts',
    )

    # タイムスタンプ
    created_at = IntField()  # レコード作成日時（Unix timestamp）
    updated_at = IntField()  # レコード更新日時（Unix timestamp）

    class Meta:
        table = TABLE_TIMELINES

    async def save(self, *args, **kwargs):
        """保存時に updated_at を自動更新"""
        import time

        if not self.created_at:
            self.created_at = int(time.time())
        self.updated_at = int(time.time())
        await super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({"Active" if self.is_active else "Inactive"})'
