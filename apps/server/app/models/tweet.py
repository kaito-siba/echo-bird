from typing import ClassVar

from tortoise.fields import (
    CASCADE,
    BigIntField,
    BooleanField,
    CharField,
    ForeignKeyField,
    IntField,
    JSONField,
    TextField,
)
from tortoise.models import Model

from app.constants import (
    DEFAULT_COUNT,
    DEFAULT_HAS_MEDIA,
    DEFAULT_IS_POSSIBLY_SENSITIVE,
    DEFAULT_IS_QUOTE,
    DEFAULT_IS_REPLY,
    DEFAULT_IS_RETWEET,
    LANGUAGE_CODE_LENGTH,
    TABLE_TWEETS,
    TWITTER_ID_LENGTH,
)


class Tweet(Model):
    """
    Twitter から twikit 経由で取得したツイートデータを管理するモデル
    """

    id = BigIntField(primary_key=True)
    tweet_id = CharField(
        max_length=TWITTER_ID_LENGTH, unique=True
    )  # Twitter 側のツイート ID (twikit: Tweet.id)
    target_account = ForeignKeyField(
        'models.TargetAccount', related_name='tweets', on_delete=CASCADE
    )  # ツイートの作成者
    content = TextField()  # ツイート本文 (twikit: Tweet.text)
    full_text = TextField(null=True)  # 省略されていない全文 (twikit: Tweet.full_text)
    lang = CharField(
        max_length=LANGUAGE_CODE_LENGTH, null=True
    )  # 言語コード (twikit: Tweet.lang)

    # エンゲージメント関連
    likes_count = IntField(
        default=DEFAULT_COUNT
    )  # いいね数 (twikit: Tweet.favorite_count)
    retweets_count = IntField(
        default=DEFAULT_COUNT
    )  # リツイート数 (twikit: Tweet.retweet_count)
    replies_count = IntField(
        default=DEFAULT_COUNT
    )  # リプライ数 (twikit: Tweet.reply_count)
    quotes_count = IntField(default=DEFAULT_COUNT)  # 引用数 (twikit: Tweet.quote_count)
    views_count = IntField(null=True)  # 表示回数 (twikit: Tweet.view_count)
    bookmark_count = IntField(
        null=True
    )  # ブックマーク数 (twikit: Tweet.bookmark_count)

    # リツイート・引用関連
    is_retweet = BooleanField(default=DEFAULT_IS_RETWEET)  # リツイートかどうか
    is_quote = BooleanField(default=DEFAULT_IS_QUOTE)  # 引用ツイートかどうか
    retweeted_tweet_id = CharField(
        max_length=TWITTER_ID_LENGTH, null=True
    )  # リツイート元のツイート ID
    quoted_tweet_id = CharField(
        max_length=TWITTER_ID_LENGTH, null=True
    )  # 引用元のツイート ID

    # リプライ関連
    is_reply = BooleanField(default=DEFAULT_IS_REPLY)  # リプライかどうか
    in_reply_to_tweet_id = CharField(
        max_length=TWITTER_ID_LENGTH, null=True
    )  # リプライ先のツイート ID
    in_reply_to_user_id = CharField(
        max_length=TWITTER_ID_LENGTH, null=True
    )  # リプライ先のユーザー ID

    # メタデータ
    conversation_id = CharField(
        max_length=TWITTER_ID_LENGTH, null=True
    )  # 会話 ID (twikit: Tweet.conversation_id)
    hashtags = JSONField(null=True)  # ハッシュタグのリスト
    urls = JSONField(null=True)  # URL のリスト
    user_mentions = JSONField(null=True)  # メンションされたユーザーのリスト

    # 状態フラグ
    is_possibly_sensitive = BooleanField(
        default=DEFAULT_IS_POSSIBLY_SENSITIVE
    )  # センシティブコンテンツの可能性
    has_media = BooleanField(
        default=DEFAULT_HAS_MEDIA
    )  # メディア（画像・動画）を含むかどうか

    posted_at = IntField()  # Twitter でツイートされた日時（Unix timestamp）
    created_at = IntField()  # レコード作成日時（Unix timestamp）
    updated_at = IntField()  # レコード更新日時（Unix timestamp）

    class Meta:
        table = TABLE_TWEETS
        indexes: ClassVar = [
            ('target_account', 'posted_at'),  # アカウント別の時系列取得用
            ('conversation_id',),  # 会話スレッド取得用
        ]

    async def save(self, *args, **kwargs):
        """保存時に updated_at を自動更新"""
        import time

        if not self.created_at:
            self.created_at = int(time.time())
        self.updated_at = int(time.time())
        await super().save(*args, **kwargs)

    def __str__(self):
        return f'@{self.target_account.username}: {self.content[:50]}...'
