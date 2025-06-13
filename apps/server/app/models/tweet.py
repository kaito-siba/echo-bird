from typing import ClassVar

from tortoise.fields import (
    CASCADE,
    BigIntField,
    BooleanField,
    CharField,
    DatetimeField,
    ForeignKeyField,
    IntField,
    JSONField,
    TextField,
)
from tortoise.models import Model


class Tweet(Model):
    """
    Twitter から twikit 経由で取得したツイートデータを管理するモデル
    """

    id = BigIntField(primary_key=True)
    tweet_id = CharField(
        max_length=50, unique=True
    )  # Twitter 側のツイート ID (twikit: Tweet.id)
    target_account = ForeignKeyField(
        'models.TargetAccount', related_name='tweets', on_delete=CASCADE
    )  # ツイートの作成者
    content = TextField()  # ツイート本文 (twikit: Tweet.text)
    full_text = TextField(null=True)  # 省略されていない全文 (twikit: Tweet.full_text)
    lang = CharField(max_length=10, null=True)  # 言語コード (twikit: Tweet.lang)

    # エンゲージメント関連
    likes_count = IntField(default=0)  # いいね数 (twikit: Tweet.favorite_count)
    retweets_count = IntField(default=0)  # リツイート数 (twikit: Tweet.retweet_count)
    replies_count = IntField(default=0)  # リプライ数 (twikit: Tweet.reply_count)
    quotes_count = IntField(default=0)  # 引用数 (twikit: Tweet.quote_count)
    views_count = IntField(null=True)  # 表示回数 (twikit: Tweet.view_count)
    bookmark_count = IntField(
        null=True
    )  # ブックマーク数 (twikit: Tweet.bookmark_count)

    # リツイート・引用関連
    is_retweet = BooleanField(default=False)  # リツイートかどうか
    is_quote = BooleanField(default=False)  # 引用ツイートかどうか
    retweeted_tweet_id = CharField(
        max_length=50, null=True
    )  # リツイート元のツイート ID
    quoted_tweet_id = CharField(max_length=50, null=True)  # 引用元のツイート ID

    # リプライ関連
    is_reply = BooleanField(default=False)  # リプライかどうか
    in_reply_to_tweet_id = CharField(
        max_length=50, null=True
    )  # リプライ先のツイート ID
    in_reply_to_user_id = CharField(max_length=50, null=True)  # リプライ先のユーザー ID

    # メタデータ
    conversation_id = CharField(
        max_length=50, null=True
    )  # 会話 ID (twikit: Tweet.conversation_id)
    hashtags = JSONField(null=True)  # ハッシュタグのリスト
    urls = JSONField(null=True)  # URL のリスト
    user_mentions = JSONField(null=True)  # メンションされたユーザーのリスト

    # 状態フラグ
    is_possibly_sensitive = BooleanField(
        default=False
    )  # センシティブコンテンツの可能性
    has_media = BooleanField(default=False)  # メディア（画像・動画）を含むかどうか

    posted_at = (
        DatetimeField()
    )  # Twitter でツイートされた日時 (twikit: Tweet.created_at)
    created_at = DatetimeField(auto_now_add=True)  # レコード作成日時
    updated_at = DatetimeField(auto_now=True)  # レコード更新日時

    class Meta:
        table = 'tweets'
        indexes: ClassVar = [
            ('target_account', 'posted_at'),  # アカウント別の時系列取得用
            ('conversation_id',),  # 会話スレッド取得用
        ]

    def __str__(self):
        return f'@{self.target_account.username}: {self.content[:50]}...'
