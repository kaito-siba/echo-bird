import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field

from app.constants import MEDIA_STATUS_COMPLETED
from app.models.bookmarked_tweet import BookmarkedTweet
from app.models.media import Media
from app.models.read_tweet import ReadTweet
from app.models.target_account import TargetAccount
from app.models.tweet import Tweet
from app.models.user import User
from app.utils.auth import get_current_user
from app.utils.media_downloader import process_single_media
from app.utils.s3_client import get_media_public_url

router = APIRouter(prefix='/api/v1/tweets', tags=['tweets'])


class MediaResponse(BaseModel):
    """メディア情報レスポンス"""

    media_key: str = Field(..., description='メディアキー')
    media_type: str = Field(
        ..., description='メディアタイプ (photo, video, animated_gif)'
    )
    media_url: str = Field(
        ..., description='メディアアクセスURL（TwitterオリジナルまたはMinIO）'
    )
    width: int | None = Field(None, description='幅')
    height: int | None = Field(None, description='高さ')
    alt_text: str | None = Field(None, description='代替テキスト')
    duration_ms: int | None = Field(None, description='再生時間（ミリ秒、動画の場合）')


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
    is_quoted: bool = Field(..., description='引用元ツイートとして保存されたかどうか')
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

    # メディア情報（新規追加）
    media: list[MediaResponse] = Field(
        default=[], description='ツイートに添付されたメディア一覧'
    )

    # 引用元ツイート情報（新規追加）
    quoted_tweet: 'TweetResponse | None' = Field(
        default=None, description='引用元ツイートの詳細情報'
    )

    # ユーザー固有の情報
    is_read: bool = Field(False, description='既読済みかどうか')
    is_bookmarked: bool = Field(False, description='ブックマーク済みかどうか')


async def get_tweet_media_info(tweet_id: int) -> list[MediaResponse]:
    """指定されたツイートのメディア情報を取得"""
    # ダウンロード状態に関係なく全メディア情報を取得
    media_items = await Media.filter(tweet_id=tweet_id).all()

    media_responses = []
    for media in media_items:
        # MinIOにダウンロード済みならMinIO URL、未ダウンロードならTwitterオリジナルURL
        if media.is_downloaded == MEDIA_STATUS_COMPLETED:
            media_url = get_media_public_url(media.media_key)
        else:
            media_url = media.media_url  # TwitterオリジナルURL

        media_response = MediaResponse(
            media_key=media.media_key,
            media_type=media.media_type,
            media_url=media_url,
            width=media.width,
            height=media.height,
            alt_text=media.alt_text,
            duration_ms=media.duration_ms,
        )
        media_responses.append(media_response)

    return media_responses


async def create_tweet_response(
    tweet: Tweet, current_user: User | None = None
) -> TweetResponse:
    """TweetモデルからTweetResponseを生成する（メディア情報込み）"""
    # メディア情報を取得
    media_info = await get_tweet_media_info(tweet.id)

    # 既読・ブックマーク状態を取得（ユーザーが指定されている場合）
    is_read = False
    is_bookmarked = False
    if current_user:
        read_tweet = await ReadTweet.filter(user=current_user, tweet=tweet).first()
        is_read = read_tweet is not None

        bookmarked_tweet = await BookmarkedTweet.filter(
            user=current_user, tweet=tweet
        ).first()
        is_bookmarked = bookmarked_tweet is not None

    # 引用元ツイート情報を取得
    quoted_tweet_response = None
    if tweet.is_quote and tweet.quoted_tweet_id:
        quoted_tweet = (
            await Tweet.filter(tweet_id=tweet.quoted_tweet_id)
            .select_related('target_account')
            .first()
        )
        if quoted_tweet:
            # 引用元ツイートのメディア情報を取得
            quoted_media_info = await get_tweet_media_info(quoted_tweet.id)
            quoted_tweet_response = TweetResponse(
                id=quoted_tweet.id,
                tweet_id=quoted_tweet.tweet_id,
                content=quoted_tweet.content,
                full_text=quoted_tweet.full_text,
                lang=quoted_tweet.lang,
                likes_count=quoted_tweet.likes_count,
                retweets_count=quoted_tweet.retweets_count,
                replies_count=quoted_tweet.replies_count,
                quotes_count=quoted_tweet.quotes_count,
                views_count=quoted_tweet.views_count,
                bookmark_count=quoted_tweet.bookmark_count,
                is_retweet=quoted_tweet.is_retweet,
                is_quote=quoted_tweet.is_quote,
                is_quoted=quoted_tweet.is_quoted,
                retweeted_tweet_id=quoted_tweet.retweeted_tweet_id,
                quoted_tweet_id=quoted_tweet.quoted_tweet_id,
                is_reply=quoted_tweet.is_reply,
                in_reply_to_tweet_id=quoted_tweet.in_reply_to_tweet_id,
                in_reply_to_user_id=quoted_tweet.in_reply_to_user_id,
                conversation_id=quoted_tweet.conversation_id,
                hashtags=quoted_tweet.hashtags,
                urls=quoted_tweet.urls,
                user_mentions=quoted_tweet.user_mentions,
                is_possibly_sensitive=quoted_tweet.is_possibly_sensitive,
                has_media=quoted_tweet.has_media,
                posted_at=quoted_tweet.posted_at,
                created_at=quoted_tweet.created_at,
                updated_at=quoted_tweet.updated_at,
                # ターゲットアカウント情報（引用元ツイートの場合は元の作者情報）
                target_account_id=quoted_tweet.target_account.id,
                target_account_username=quoted_tweet.original_author_username
                or quoted_tweet.target_account.username,
                target_account_display_name=quoted_tweet.original_author_display_name
                or quoted_tweet.target_account.display_name,
                target_account_profile_image_url=quoted_tweet.original_author_profile_image_url
                or quoted_tweet.target_account.profile_image_url,
                # リツイート・引用ツイート情報
                original_author_username=quoted_tweet.original_author_username,
                original_author_display_name=quoted_tweet.original_author_display_name,
                original_author_profile_image_url=quoted_tweet.original_author_profile_image_url,
                # メディア情報
                media=quoted_media_info,
                # 引用元ツイート（再帰を避けるためNone）
                quoted_tweet=None,
                # ユーザー固有の情報
                is_read=is_read,
                is_bookmarked=is_bookmarked,
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
        is_quoted=tweet.is_quoted,
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
        # メディア情報
        media=media_info,
        # 引用元ツイート情報
        quoted_tweet=quoted_tweet_response,
        # ユーザー固有の情報
        is_read=is_read,
        is_bookmarked=is_bookmarked,
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
    # is_quoted=False のツイートのみを取得（引用元ツイートを除外）
    offset = (page - 1) * page_size
    tweets_query = (
        Tweet.filter(target_account_id__in=target_account_ids, is_quoted=False)
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
        tweet_response = await create_tweet_response(tweet, current_user)
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


class BookmarkedTweetsResponse(BaseModel):
    """ブックマーク一覧取得レスポンス"""

    tweets: list[TweetResponse] = Field(
        ..., description='ブックマークされたツイート一覧'
    )
    total: int = Field(..., description='総ブックマーク数')
    page: int = Field(..., description='現在のページ番号')
    page_size: int = Field(..., description='1ページあたりのツイート数')
    has_next: bool = Field(..., description='次のページが存在するかどうか')


@router.get('/bookmarked', response_model=BookmarkedTweetsResponse)
async def BookmarkedTweetsAPI(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description='ページ番号'),
    page_size: int = Query(20, ge=1, le=100, description='1ページあたりのツイート数'),
) -> BookmarkedTweetsResponse:
    """
    ブックマーク一覧取得 API

    現在のユーザーがブックマークしたツイート一覧を
    ブックマーク日時順（新しいものから）で取得します。
    """
    # ブックマークされたツイートIDを取得（ページネーション付き）
    offset = (page - 1) * page_size
    bookmarked_tweets_query = (
        BookmarkedTweet.filter(user=current_user)
        .select_related('tweet__target_account')
        .order_by('-bookmarked_at')
    )

    # 総数を取得
    total = await bookmarked_tweets_query.count()

    # ページネーション適用
    bookmarked_tweets = (
        await bookmarked_tweets_query.offset(offset).limit(page_size).all()
    )

    # レスポンス用にデータを変換
    tweet_responses = []
    for bookmarked_tweet in bookmarked_tweets:
        tweet_response = await create_tweet_response(
            bookmarked_tweet.tweet, current_user
        )
        tweet_responses.append(tweet_response)

    # 次のページが存在するかチェック
    has_next = offset + page_size < total

    return BookmarkedTweetsResponse(
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

    # ツイートを取得（引用元ツイートは除外）
    tweet = (
        await Tweet.filter(
            tweet_id=tweet_id, target_account_id__in=target_account_ids, is_quoted=False
        )
        .select_related('target_account')
        .first()
    )

    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたツイートが見つかりません',
        )

    return await create_tweet_response(tweet, current_user)


@router.post('/bookmark/{tweet_id}', response_model=dict[str, str | bool])
async def ToggleBookmarkAPI(
    tweet_id: int,
    current_user: User = Depends(get_current_user),
) -> dict[str, str | bool]:
    """
    ブックマーク切り替え API

    指定されたツイートのブックマーク状態を切り替えます。
    ブックマーク済みの場合は削除、未ブックマークの場合は追加します。
    """
    # ツイートの存在確認
    tweet = await Tweet.filter(id=tweet_id).first()
    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたツイートが見つかりません',
        )

    # 既存のブックマークを確認
    bookmarked_tweet = await BookmarkedTweet.filter(
        user=current_user, tweet=tweet
    ).first()

    if bookmarked_tweet:
        # ブックマーク済みの場合は削除
        await bookmarked_tweet.delete()
        return {
            'message': 'ブックマークを削除しました',
            'is_bookmarked': False,
        }
    else:
        # 未ブックマークの場合は追加
        await BookmarkedTweet.create(user=current_user, tweet=tweet)

        # ブックマーク追加時にツイートのメディアを MinIO に保存開始
        await _process_tweet_media_for_bookmark(tweet)

        return {
            'message': 'ブックマークに追加しました',
            'is_bookmarked': True,
        }


@router.post('/read/{tweet_id}', response_model=dict[str, str])
async def MarkTweetAsReadAPI(
    tweet_id: int,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    既読状態更新 API

    指定されたツイートを既読状態にします。
    """
    # ツイートの存在確認
    tweet = await Tweet.filter(id=tweet_id).first()
    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたツイートが見つかりません',
        )

    # 既存の既読記録を確認
    read_tweet = await ReadTweet.filter(user=current_user, tweet=tweet).first()

    if not read_tweet:
        # 未読の場合は既読状態を作成
        await ReadTweet.create(user=current_user, tweet=tweet)

    return {'message': 'ツイートを既読にしました'}


async def _process_single_media_background(
    media_id: int, media_key: str, tweet_id: str
) -> None:
    """
    単一メディアをバックグラウンドで処理する内部関数

    Args:
        media_id: メディアID
        media_key: メディアキー（ログ用）
        tweet_id: ツイートID（ログ用）
    """
    try:
        await process_single_media(media_id)
    except Exception as ex:
        # ログに記録（バックグラウンド処理のため例外は再発生させない）
        print(
            f'Failed to process media {media_key} for bookmarked tweet {tweet_id}: {ex}'
        )


async def _process_tweet_media_for_bookmark(tweet: Tweet) -> None:
    """
    ブックマーク時にツイートのメディアを MinIO に保存する処理（バックグラウンド実行）

    Args:
        tweet: ブックマークされたツイート
    """
    # ツイート自身のメディアを処理
    main_media_items = await Media.filter(tweet=tweet).all()

    # メインツイートのメディアをバックグラウンドでダウンロード開始
    for media in main_media_items:
        # バックグラウンドタスクとして実行（awaitしない）
        asyncio.create_task(
            _process_single_media_background(media.id, media.media_key, tweet.tweet_id)
        )

    # 引用ツイートがある場合、そのメディアも処理
    if tweet.is_quote and tweet.quoted_tweet_id:
        quoted_tweet = await Tweet.filter(tweet_id=tweet.quoted_tweet_id).first()
        if quoted_tweet:
            quoted_media_items = await Media.filter(tweet=quoted_tweet).all()

            # 引用ツイートのメディアもバックグラウンドでダウンロード開始
            for media in quoted_media_items:
                # バックグラウンドタスクとして実行（awaitしない）
                asyncio.create_task(
                    _process_single_media_background(
                        media.id, media.media_key, tweet.tweet_id
                    )
                )
