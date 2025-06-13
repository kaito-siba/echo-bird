from tortoise.fields import (
    CASCADE,
    BigIntField,
    DatetimeField,
    ForeignKeyField,
)
from tortoise.models import Model


class ReadTweet(Model):
    """
    ユーザーが既読したツイートを管理するモデル
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField('models.User', related_name='read_tweets', on_delete=CASCADE)  # 既読したユーザー
    tweet = ForeignKeyField('models.Tweet', related_name='read_by', on_delete=CASCADE)  # 既読されたツイート
    read_at = DatetimeField(auto_now_add=True)  # 既読した日時

    class Meta:
        table = 'read_tweets'
        unique_together = (('user', 'tweet'),)  # 同じユーザーが同じツイートを複数回既読にすることを防ぐ

    def __str__(self):
        return f'{self.user.username} read {self.tweet.tweet_id}'
