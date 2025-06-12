from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from tortoise.exceptions import DoesNotExist

from app.models import Tweet

router = APIRouter()


@router.get('/tweets')
async def get_tweets(
    start_date: str | None = Query(None, description='開始日(YYYY-MM-DD)'),
    end_date: str | None = Query(None, description='終了日(YYYY-MM-DD)'),
    search: str | None = Query(None, description='検索キーワード'),
    sort_by: str | None = Query('posted_at', description='ソート条件'),
    order: str | None = Query('desc', description='ソート順序(asc/desc)'),
) -> dict[str, Any]:
    """ツイート一覧取得"""
    query = Tweet.all().select_related('user')

    # 期間フィルタリング
    if start_date:
        start_datetime = datetime.fromisoformat(start_date)
        query = query.filter(posted_at__gte=start_datetime)

    if end_date:
        end_datetime = datetime.fromisoformat(end_date)
        query = query.filter(posted_at__lte=end_datetime)

    # キーワード検索
    if search:
        query = query.filter(content__icontains=search)

    # ソート
    if sort_by in ['likes_count', 'retweets_count', 'posted_at']:
        if order == 'desc':
            sort_by = f'-{sort_by}'
        query = query.order_by(sort_by)

    tweets = await query

    return {
        'tweets': [
            {
                'id': tweet.id,
                'tweet_id': tweet.tweet_id,
                'content': tweet.content,
                'tweet_url': tweet.tweet_url,
                'likes_count': tweet.likes_count,
                'retweets_count': tweet.retweets_count,
                'posted_at': tweet.posted_at.isoformat(),
                'is_read': tweet.is_read,
                'is_bookmarked': tweet.is_bookmarked,
                'user': {
                    'id': tweet.user.id,
                    'username': tweet.user.username,
                    'display_name': tweet.user.display_name,
                    'profile_url': tweet.user.profile_url,
                    'profile_image_url': tweet.user.profile_image_url,
                },
            }
            for tweet in tweets
        ]
    }


@router.post('/tweets/read/{tweet_id}')
async def mark_tweet_as_read(tweet_id: int) -> dict[str, Any]:
    """ツイートを既読にする"""
    try:
        tweet = await Tweet.get(id=tweet_id)
        tweet.is_read = True
        await tweet.save()
        return {'message': 'ツイートを既読にしました', 'tweet_id': tweet_id}
    except DoesNotExist:
        raise HTTPException(
            status_code=404, detail='ツイートが見つかりません'
        ) from None


@router.post('/tweets/bookmark/{tweet_id}')
async def toggle_bookmark(tweet_id: int) -> dict[str, Any]:
    """ブックマークの追加・削除を切り替える"""
    try:
        tweet = await Tweet.get(id=tweet_id)
        tweet.is_bookmarked = not tweet.is_bookmarked
        await tweet.save()
        action = '追加' if tweet.is_bookmarked else '削除'
        return {
            'message': f'ブックマークを{action}しました',
            'tweet_id': tweet_id,
            'is_bookmarked': tweet.is_bookmarked,
        }
    except DoesNotExist:
        raise HTTPException(
            status_code=404, detail='ツイートが見つかりません'
        ) from None


@router.get('/tweets/bookmarked')
async def get_bookmarked_tweets() -> dict[str, Any]:
    """ブックマークしたツイート一覧を取得"""
    tweets = (
        await Tweet.filter(is_bookmarked=True)
        .select_related('user')
        .order_by('-posted_at')
    )

    return {
        'bookmarked_tweets': [
            {
                'id': tweet.id,
                'tweet_id': tweet.tweet_id,
                'content': tweet.content,
                'tweet_url': tweet.tweet_url,
                'likes_count': tweet.likes_count,
                'retweets_count': tweet.retweets_count,
                'posted_at': tweet.posted_at.isoformat(),
                'user': {
                    'id': tweet.user.id,
                    'username': tweet.user.username,
                    'display_name': tweet.user.display_name,
                    'profile_url': tweet.user.profile_url,
                    'profile_image_url': tweet.user.profile_image_url,
                },
            }
            for tweet in tweets
        ]
    }
