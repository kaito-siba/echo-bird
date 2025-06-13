from tortoise.fields import (
    CASCADE,
    BigIntField,
    ForeignKeyField,
    IntField,
)
from tortoise.models import Model

from app.constants import TABLE_READ_TWEETS


class ReadTweet(Model):
    """
    ユーザーが既読したツイートを管理するモデル
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField(
        'models.User', related_name='read_tweets', on_delete=CASCADE
    )  # 既読したユーザー
    tweet = ForeignKeyField(
        'models.Tweet', related_name='read_by', on_delete=CASCADE
    )  # 既読されたツイート
    read_at = IntField()  # 既読した日時（Unix timestamp）

    class Meta:
        table = TABLE_READ_TWEETS
        unique_together = (
            ('user', 'tweet'),
        )  # 同じユーザーが同じツイートを複数回既読にすることを防ぐ

    async def save(self, *args, **kwargs):
        """保存時に read_at を自動設定"""
        import time

        if not self.read_at:
            self.read_at = int(time.time())
        await super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user.username} read {self.tweet.tweet_id}'
