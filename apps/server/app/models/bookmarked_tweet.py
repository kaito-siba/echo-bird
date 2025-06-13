from tortoise.fields import (
    CASCADE,
    BigIntField,
    ForeignKeyField,
    IntField,
)
from tortoise.models import Model

from app.constants import TABLE_BOOKMARKED_TWEETS


class BookmarkedTweet(Model):
    """
    ユーザーがブックマークしたツイートを管理するモデル
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField(
        'models.User', related_name='bookmarked_tweets', on_delete=CASCADE
    )  # ブックマークしたユーザー
    tweet = ForeignKeyField(
        'models.Tweet', related_name='bookmarked_by', on_delete=CASCADE
    )  # ブックマークされたツイート
    bookmarked_at = IntField()  # ブックマークした日時（Unix timestamp）

    class Meta:
        table = TABLE_BOOKMARKED_TWEETS
        unique_together = (
            ('user', 'tweet'),
        )  # 同じユーザーが同じツイートを複数回ブックマークすることを防ぐ

    async def save(self, *args, **kwargs):
        """保存時に bookmarked_at を自動設定"""
        import time

        if not self.bookmarked_at:
            self.bookmarked_at = int(time.time())
        await super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user.username} bookmarked {self.tweet.tweet_id}'
