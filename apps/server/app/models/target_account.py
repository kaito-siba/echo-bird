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
        max_length=50, unique=True
    )  # Twitter 側のユーザー ID (twikit: User.id)
    username = CharField(max_length=255)  # @なしのユーザー名 (twikit: User.screen_name)
    display_name = CharField(max_length=255, null=True)  # 表示名 (twikit: User.name)
    description = TextField(null=True)  # 自己紹介文 (twikit: User.description)
    location = CharField(max_length=255, null=True)  # 場所 (twikit: User.location)
    url = CharField(max_length=500, null=True)  # プロフィール URL (twikit: User.url)

    # プロフィール画像
    profile_image_url = CharField(
        max_length=500, null=True
    )  # プロフィール画像 URL (twikit: User.profile_image_url_https)
    profile_banner_url = CharField(
        max_length=500, null=True
    )  # ヘッダー画像 URL (twikit: User.profile_banner_url)

    # アカウント状態
    is_active = BooleanField(default=True)  # アクティブにツイートを取得するかどうか
    is_protected = BooleanField(
        default=False
    )  # 非公開アカウントかどうか (twikit: User.protected)
    is_verified = BooleanField(
        default=False
    )  # 認証済みアカウントかどうか (twikit: User.verified)
    is_blue_verified = BooleanField(
        default=False
    )  # Twitter Blue 認証 (twikit: User.is_blue_verified)

    # 統計情報
    followers_count = IntField(default=0)  # フォロワー数 (twikit: User.followers_count)
    following_count = IntField(default=0)  # フォロー数 (twikit: User.friends_count)
    tweets_count = IntField(default=0)  # ツイート数 (twikit: User.statuses_count)
    listed_count = IntField(
        default=0
    )  # リストに追加されている数 (twikit: User.listed_count)
    favorites_count = IntField(default=0)  # いいね数 (twikit: User.favourites_count)

    # 取得管理
    last_fetched_at = DatetimeField(null=True)  # 最後にツイートを取得した日時
    last_tweet_id = CharField(max_length=50, null=True)  # 最後に取得したツイート ID
    fetch_interval_minutes = IntField(default=60)  # 取得間隔（分）
    max_tweets_per_fetch = IntField(default=100)  # 一度に取得する最大ツイート数

    # エラー管理
    consecutive_errors = IntField(default=0)  # 連続エラー回数
    last_error = TextField(null=True)  # 最後のエラーメッセージ
    last_error_at = DatetimeField(null=True)  # 最後のエラー発生日時

    # メタデータ
    account_created_at = DatetimeField(
        null=True
    )  # Twitter アカウント作成日 (twikit: User.created_at)
    created_at = DatetimeField(auto_now_add=True)  # レコード作成日時
    updated_at = DatetimeField(auto_now=True)  # レコード更新日時

    class Meta:
        table = 'target_accounts'

    def __str__(self):
        return f'@{self.username} ({"Active" if self.is_active else "Inactive"})'
