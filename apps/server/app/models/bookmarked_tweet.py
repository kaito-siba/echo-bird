from tortoise.fields import (
    CASCADE,
    BigIntField,
    DatetimeField,
    ForeignKeyField,
)
from tortoise.models import Model


class BookmarkedTweet(Model):
    """
    ユーザーがブックマークしたツイートを管理するモデル
    """

    id = BigIntField(primary_key=True)
    user = ForeignKeyField('models.User', related_name='bookmarked_tweets', on_delete=CASCADE)  # ブックマークしたユーザー
    tweet = ForeignKeyField('models.Tweet', related_name='bookmarked_by', on_delete=CASCADE)  # ブックマークされたツイート
    bookmarked_at = DatetimeField(auto_now_add=True)  # ブックマークした日時

    class Meta:
        table = 'bookmarked_tweets'
        unique_together = (('user', 'tweet'),)  # 同じユーザーが同じツイートを複数回ブックマークすることを防ぐ

    def __str__(self):
        return f'{self.user.username} bookmarked {self.tweet.tweet_id}'
