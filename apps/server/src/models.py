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


class User(Model):
    id = BigIntField(primary_key=True)
    twitter_user_id = CharField(max_length=50, unique=True)
    username = CharField(max_length=255)
    display_name = CharField(max_length=255, null=True)
    profile_url = CharField(max_length=500, null=True)
    profile_image_url = CharField(max_length=500, null=True)
    created_at = DatetimeField(auto_now_add=True)
    updated_at = DatetimeField(auto_now=True)

    class Meta:
        table = "users"

    def __str__(self):
        return self.username


class Tweet(Model):
    id = BigIntField(primary_key=True)
    tweet_id = CharField(max_length=50, unique=True)
    user = ForeignKeyField("models.User", related_name="tweets", on_delete=CASCADE)
    content = TextField()
    tweet_url = CharField(max_length=500, null=True)
    likes_count = IntField(default=0)
    retweets_count = IntField(default=0)
    posted_at = DatetimeField()
    is_read = BooleanField(default=False)
    is_bookmarked = BooleanField(default=False)
    created_at = DatetimeField(auto_now_add=True)
    updated_at = DatetimeField(auto_now=True)

    class Meta:
        table = "tweets"

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."
