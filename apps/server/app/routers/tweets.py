from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field

from app.models.target_account import TargetAccount
from app.models.tweet import Tweet
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter(prefix='/api/v1/tweets', tags=['tweets'])


class TweetResponse(BaseModel):
    """ツイート情報レスポンス"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description='ツイート ID')
    tweet_id: str = Field(..., description='Twitter ツイート ID')
    content: str = Field(..., description='ツイート本文')
    full_text: str | None = Field(None, description='省略されていない全文')
    lang: str | None = Field(None, description='言語コード')
    likes_count: int = Field(..., description='いいね数')
    retweets_count: int = Field(..., description='リツイート数')
    replies_count: int = Field(..., description='リプライ数')
    quotes_count: int = Field(..., description='引用数')
    views_count: int | None = Field(None, description='表示回数')
    bookmark_count: int | None = Field(None, description='ブックマーク数')
    is_retweet: bool = Field(..., description='リツイートかどうか')
    is_quote: bool = Field(..., description='引用ツイートかどうか')
    retweeted_tweet_id: str | None = Field(
        None, description='リツイート元のツイート ID'
    )
    quoted_tweet_id: str | None = Field(None, description='引用元のツイート ID')
    is_reply: bool = Field(..., description='リプライかどうか')
    in_reply_to_tweet_id: str | None = Field(
        None, description='リプライ先のツイート ID'
    )
    in_reply_to_user_id: str | None = Field(None, description='リプライ先のユーザー ID')
    conversation_id: str | None = Field(None, description='会話 ID')
    hashtags: list | None = Field(None, description='ハッシュタグのリスト')
    urls: list | None = Field(None, description='URL のリスト')
    user_mentions: list | None = Field(
        None, description='メンションされたユーザーのリスト'
    )
    is_possibly_sensitive: bool = Field(
        ..., description='センシティブコンテンツの可能性'
    )
    has_media: bool = Field(..., description='メディアを含むかどうか')
    posted_at: int = Field(..., description='ツイート投稿日時（Unix timestamp）')
    created_at: int = Field(..., description='レコード作成日時（Unix timestamp）')
    updated_at: int = Field(..., description='レコード更新日時（Unix timestamp）')

    # ターゲットアカウント情報を含める
    target_account_id: int = Field(..., description='ターゲットアカウント ID')
    target_account_username: str = Field(
        ..., description='ターゲットアカウントのユーザー名'
    )
    target_account_display_name: str | None = Field(
        None, description='ターゲットアカウントの表示名'
    )
    target_account_profile_image_url: str | None = Field(
        None, description='ターゲットアカウントのプロフィール画像 URL'
    )

    # リツイート・引用ツイート情報
    original_author_username: str | None = Field(
        None, description='元ツイート作者のユーザー名（リツイート・引用の場合）'
    )
    original_author_display_name: str | None = Field(
        None, description='元ツイート作者の表示名（リツイート・引用の場合）'
    )
    original_author_profile_image_url: str | None = Field(
        None,
        description='元ツイート作者のプロフィール画像 URL（リツイート・引用の場合）',
    )


class TimelineResponse(BaseModel):
    """タイムライン取得レスポンス"""

    tweets: list[TweetResponse] = Field(..., description='ツイート一覧')
    total: int = Field(..., description='総ツイート数')
    page: int = Field(..., description='現在のページ番号')
    page_size: int = Field(..., description='1ページあたりのツイート数')
    has_next: bool = Field(..., description='次のページが存在するかどうか')


@router.get('/timeline', response_model=TimelineResponse)
async def TweetTimelineAPI(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description='ページ番号'),
    page_size: int = Query(20, ge=1, le=100, description='1ページあたりのツイート数'),
    target_account_id: int | None = Query(
        None, description='特定のターゲットアカウントのツイートのみ取得'
    ),
) -> TimelineResponse:
    """
    タイムライン取得 API

    ユーザーに紐づいたターゲットアカウントのツイート一覧を
    時系列順（新しいものから）で取得します。
    """
    # ユーザーに紐づいたターゲットアカウントのIDを取得
    target_accounts = await TargetAccount.filter(
        user=current_user, is_active=True
    ).all()

    if not target_accounts:
        return TimelineResponse(
            tweets=[],
            total=0,
            page=page,
            page_size=page_size,
            has_next=False,
        )

    target_account_ids = [account.id for account in target_accounts]

    # 特定のターゲットアカウントが指定されている場合
    if target_account_id is not None:
        if target_account_id not in target_account_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='指定されたターゲットアカウントが見つかりません',
            )
        target_account_ids = [target_account_id]

    # ツイート一覧を取得（ページネーション付き）
    offset = (page - 1) * page_size
    tweets_query = (
        Tweet.filter(target_account_id__in=target_account_ids)
        .select_related('target_account')
        .order_by('-posted_at')
    )

    # 総数を取得
    total = await tweets_query.count()

    # ページネーション適用
    tweets = await tweets_query.offset(offset).limit(page_size).all()

    # レスポンス用にデータを変換
    tweet_responses = []
    for tweet in tweets:
        tweet_response = TweetResponse(
            id=tweet.id,
            tweet_id=tweet.tweet_id,
            content=tweet.content,
            full_text=tweet.full_text,
            lang=tweet.lang,
            likes_count=tweet.likes_count,
            retweets_count=tweet.retweets_count,
            replies_count=tweet.replies_count,
            quotes_count=tweet.quotes_count,
            views_count=tweet.views_count,
            bookmark_count=tweet.bookmark_count,
            is_retweet=tweet.is_retweet,
            is_quote=tweet.is_quote,
            retweeted_tweet_id=tweet.retweeted_tweet_id,
            quoted_tweet_id=tweet.quoted_tweet_id,
            is_reply=tweet.is_reply,
            in_reply_to_tweet_id=tweet.in_reply_to_tweet_id,
            in_reply_to_user_id=tweet.in_reply_to_user_id,
            conversation_id=tweet.conversation_id,
            hashtags=tweet.hashtags,
            urls=tweet.urls,
            user_mentions=tweet.user_mentions,
            is_possibly_sensitive=tweet.is_possibly_sensitive,
            has_media=tweet.has_media,
            posted_at=tweet.posted_at,
            created_at=tweet.created_at,
            updated_at=tweet.updated_at,
            # ターゲットアカウント情報
            target_account_id=tweet.target_account.id,
            target_account_username=tweet.target_account.username,
            target_account_display_name=tweet.target_account.display_name,
            target_account_profile_image_url=tweet.target_account.profile_image_url,
            # リツイート・引用ツイート情報
            original_author_username=tweet.original_author_username,
            original_author_display_name=tweet.original_author_display_name,
            original_author_profile_image_url=tweet.original_author_profile_image_url,
        )
        tweet_responses.append(tweet_response)

    # 次のページが存在するかチェック
    has_next = offset + page_size < total

    return TimelineResponse(
        tweets=tweet_responses,
        total=total,
        page=page,
        page_size=page_size,
        has_next=has_next,
    )


@router.get('/{tweet_id}', response_model=TweetResponse)
async def TweetDetailAPI(
    tweet_id: str,
    current_user: User = Depends(get_current_user),
) -> TweetResponse:
    """
    ツイート詳細取得 API

    指定されたツイートIDの詳細情報を取得します。
    """
    # ユーザーに紐づいたターゲットアカウントのIDを取得
    target_accounts = await TargetAccount.filter(
        user=current_user, is_active=True
    ).all()
    target_account_ids = [account.id for account in target_accounts]

    # ツイートを取得
    tweet = (
        await Tweet.filter(tweet_id=tweet_id, target_account_id__in=target_account_ids)
        .select_related('target_account')
        .first()
    )

    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたツイートが見つかりません',
        )

    return TweetResponse(
        id=tweet.id,
        tweet_id=tweet.tweet_id,
        content=tweet.content,
        full_text=tweet.full_text,
        lang=tweet.lang,
        likes_count=tweet.likes_count,
        retweets_count=tweet.retweets_count,
        replies_count=tweet.replies_count,
        quotes_count=tweet.quotes_count,
        views_count=tweet.views_count,
        bookmark_count=tweet.bookmark_count,
        is_retweet=tweet.is_retweet,
        is_quote=tweet.is_quote,
        retweeted_tweet_id=tweet.retweeted_tweet_id,
        quoted_tweet_id=tweet.quoted_tweet_id,
        is_reply=tweet.is_reply,
        in_reply_to_tweet_id=tweet.in_reply_to_tweet_id,
        in_reply_to_user_id=tweet.in_reply_to_user_id,
        conversation_id=tweet.conversation_id,
        hashtags=tweet.hashtags,
        urls=tweet.urls,
        user_mentions=tweet.user_mentions,
        is_possibly_sensitive=tweet.is_possibly_sensitive,
        has_media=tweet.has_media,
        posted_at=tweet.posted_at,
        created_at=tweet.created_at,
        updated_at=tweet.updated_at,
        # ターゲットアカウント情報
        target_account_id=tweet.target_account.id,
        target_account_username=tweet.target_account.username,
        target_account_display_name=tweet.target_account.display_name,
        target_account_profile_image_url=tweet.target_account.profile_image_url,
        # リツイート・引用ツイート情報
        original_author_username=tweet.original_author_username,
        original_author_display_name=tweet.original_author_display_name,
        original_author_profile_image_url=tweet.original_author_profile_image_url,
    )
