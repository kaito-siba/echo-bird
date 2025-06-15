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
    DEFAULT_INTERVAL_MINUTES,
    DEFAULT_IS_ACTIVE,
    DEFAULT_IS_PROTECTED,
    DEFAULT_IS_VERIFIED,
    DEFAULT_MAX_TWEETS_PER_FETCH,
    FIELD_LENGTH_MEDIUM,
    TABLE_TARGET_ACCOUNTS,
    TWITTER_ID_LENGTH,
    URL_MAX_LENGTH,
)


class TargetAccount(Model):
    """
    ツイート取得対象の Twitter アカウント情報を管理するモデル
    twikit の User オブジェクトから取得した情報を保存
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField(
        'models.User', related_name='target_accounts', on_delete=CASCADE
    )  # 登録した EchoBird ユーザー

    # 基本情報 (twikit: User)
    twitter_user_id = CharField(
        max_length=TWITTER_ID_LENGTH, unique=True
    )  # Twitter 側のユーザー ID (twikit: User.id)
    username = CharField(
        max_length=FIELD_LENGTH_MEDIUM
    )  # @なしのユーザー名 (twikit: User.screen_name)
    display_name = CharField(
        max_length=FIELD_LENGTH_MEDIUM, null=True
    )  # 表示名 (twikit: User.name)
    description = TextField(null=True)  # 自己紹介文 (twikit: User.description)
    location = CharField(
        max_length=FIELD_LENGTH_MEDIUM, null=True
    )  # 場所 (twikit: User.location)
    url = CharField(
        max_length=URL_MAX_LENGTH, null=True
    )  # プロフィール URL (twikit: User.url)

    # プロフィール画像
    profile_image_url = CharField(
        max_length=URL_MAX_LENGTH, null=True
    )  # プロフィール画像 URL (twikit: User.profile_image_url)
    profile_banner_url = CharField(
        max_length=URL_MAX_LENGTH, null=True
    )  # ヘッダー画像 URL (twikit: User.profile_banner_url)

    # アカウント状態
    is_active = BooleanField(
        default=DEFAULT_IS_ACTIVE
    )  # アクティブにツイートを取得するかどうか
    is_protected = BooleanField(
        default=DEFAULT_IS_PROTECTED
    )  # 非公開アカウントかどうか (twikit: User.protected)
    is_verified = BooleanField(
        default=DEFAULT_IS_VERIFIED
    )  # 認証済みアカウントかどうか (twikit: User.verified)
    is_blue_verified = BooleanField(
        default=DEFAULT_IS_VERIFIED
    )  # Twitter Blue 認証 (twikit: User.is_blue_verified)

    # 統計情報
    followers_count = IntField(
        default=DEFAULT_COUNT
    )  # フォロワー数 (twikit: User.followers_count)
    following_count = IntField(
        default=DEFAULT_COUNT
    )  # フォロー数 (twikit: User.friends_count)
    tweets_count = IntField(
        default=DEFAULT_COUNT
    )  # ツイート数 (twikit: User.statuses_count)
    listed_count = IntField(
        default=DEFAULT_COUNT
    )  # リストに追加されている数 (twikit: User.listed_count)
    favorites_count = IntField(
        default=DEFAULT_COUNT
    )  # いいね数 (twikit: User.favourites_count)

    # 取得管理
    last_fetched_at = IntField(
        null=True
    )  # 最後にツイートを取得した日時（Unix timestamp）
    last_tweet_id = CharField(
        max_length=TWITTER_ID_LENGTH, null=True
    )  # 最後に取得したツイート ID
    fetch_interval_minutes = IntField(
        default=DEFAULT_INTERVAL_MINUTES
    )  # 取得間隔（分）
    max_tweets_per_fetch = IntField(
        default=DEFAULT_MAX_TWEETS_PER_FETCH
    )  # 一度に取得する最大ツイート数

    # エラー管理
    consecutive_errors = IntField(default=DEFAULT_COUNT)  # 連続エラー回数
    last_error = TextField(null=True)  # 最後のエラーメッセージ
    last_error_at = IntField(null=True)  # 最後のエラー発生日時（Unix timestamp）

    # メタデータ
    account_created_at = IntField(
        null=True
    )  # Twitter アカウント作成日（Unix timestamp）
    created_at = IntField()  # レコード作成日時（Unix timestamp）
    updated_at = IntField()  # レコード更新日時（Unix timestamp）

    class Meta:
        table = TABLE_TARGET_ACCOUNTS

    async def save(self, *args, **kwargs):
        """保存時に updated_at を自動更新"""
        import time

        if not self.created_at:
            self.created_at = int(time.time())
        self.updated_at = int(time.time())
        await super().save(*args, **kwargs)

    def __str__(self):
        return f'@{self.username} ({"Active" if self.is_active else "Inactive"})'
