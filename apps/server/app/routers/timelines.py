from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field

from app.models.target_account import TargetAccount
from app.models.timeline import Timeline
from app.models.tweet import Tweet
from app.models.user import User
from app.routers.tweets import TweetResponse, create_tweet_response
from app.utils.auth import get_current_user

router = APIRouter(prefix='/api/v1/timelines', tags=['timelines'])


class TimelineCreateRequest(BaseModel):
    """タイムライン作成リクエスト"""

    name: str = Field(..., description='タイムライン名', min_length=1, max_length=255)
    description: str | None = Field(None, description='タイムラインの説明')
    target_account_ids: list[int] = Field(
        ...,
        description='タイムラインに含めるターゲットアカウントIDのリスト',
        min_length=1,
    )
    is_active: bool = Field(True, description='アクティブ状態')
    is_default: bool = Field(False, description='デフォルトタイムラインかどうか')


class TimelineUpdateRequest(BaseModel):
    """タイムライン更新リクエスト"""

    name: str | None = Field(
        None, description='タイムライン名', min_length=1, max_length=255
    )
    description: str | None = Field(None, description='タイムラインの説明')
    target_account_ids: list[int] | None = Field(
        None, description='タイムラインに含めるターゲットアカウントIDのリスト'
    )
    is_active: bool | None = Field(None, description='アクティブ状態')
    is_default: bool | None = Field(None, description='デフォルトタイムラインかどうか')


class TargetAccountSummary(BaseModel):
    """ターゲットアカウント要約情報"""

    id: int = Field(..., description='ターゲットアカウント ID')
    username: str = Field(..., description='Twitter ユーザー名')
    display_name: str | None = Field(None, description='表示名')
    profile_image_url: str | None = Field(None, description='プロフィール画像 URL')
    is_active: bool = Field(..., description='アクティブ状態')


class TimelineResponse(BaseModel):
    """タイムライン情報レスポンス"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description='タイムライン ID')
    name: str = Field(..., description='タイムライン名')
    description: str | None = Field(None, description='タイムラインの説明')
    is_active: bool = Field(..., description='アクティブ状態')
    is_default: bool = Field(..., description='デフォルトタイムラインかどうか')
    created_at: int = Field(..., description='レコード作成日時（Unix timestamp）')
    updated_at: int = Field(..., description='レコード更新日時（Unix timestamp）')
    target_accounts: list[TargetAccountSummary] = Field(
        ..., description='タイムラインに含まれるターゲットアカウント一覧'
    )


class TimelineListResponse(BaseModel):
    """タイムライン一覧レスポンス"""

    timelines: list[TimelineResponse] = Field(..., description='タイムライン一覧')
    total: int = Field(..., description='タイムライン総数')


class TimelineTweetsResponse(BaseModel):
    """タイムライン内ツイート一覧レスポンス"""

    timeline: TimelineResponse = Field(..., description='タイムライン情報')
    tweets: list[TweetResponse] = Field(..., description='ツイート一覧')
    total: int = Field(..., description='総ツイート数')
    page: int = Field(..., description='現在のページ番号')
    page_size: int = Field(..., description='1ページあたりのツイート数')
    has_next: bool = Field(..., description='次のページが存在するかどうか')


async def create_timeline_response(timeline: Timeline) -> TimelineResponse:
    """Timeline モデルから TimelineResponse を生成する"""
    # ターゲットアカウント情報を取得
    target_accounts = await timeline.target_accounts.all()
    target_account_summaries = [
        TargetAccountSummary(
            id=account.id,
            username=account.username,
            display_name=account.display_name,
            profile_image_url=account.profile_image_url,
            is_active=account.is_active,
        )
        for account in target_accounts
    ]

    return TimelineResponse(
        id=timeline.id,
        name=timeline.name,
        description=timeline.description,
        is_active=timeline.is_active,
        is_default=timeline.is_default,
        created_at=timeline.created_at,
        updated_at=timeline.updated_at,
        target_accounts=target_account_summaries,
    )


@router.post('', response_model=TimelineResponse)
async def TimelineCreateAPI(
    request: TimelineCreateRequest,
    current_user: User = Depends(get_current_user),
) -> TimelineResponse:
    """
    タイムライン作成 API

    指定されたターゲットアカウントを組み合わせたカスタムタイムラインを作成します。
    """
    # ターゲットアカウントの存在確認（すべて現在のユーザーに属するもの）
    target_accounts = await TargetAccount.filter(
        id__in=request.target_account_ids,
        user=current_user,
    ).all()

    if len(target_accounts) != len(request.target_account_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='指定されたターゲットアカウントの一部が見つかりません',
        )

    # デフォルトタイムラインの場合、既存のデフォルトを無効化
    if request.is_default:
        await Timeline.filter(user=current_user, is_default=True).update(
            is_default=False
        )

    # タイムライン作成
    timeline = await Timeline.create(
        user=current_user,
        name=request.name,
        description=request.description,
        is_active=request.is_active,
        is_default=request.is_default,
    )

    # ターゲットアカウントとの関連付け
    await timeline.target_accounts.add(*target_accounts)

    return await create_timeline_response(timeline)


@router.get('', response_model=TimelineListResponse)
async def TimelineListAPI(
    current_user: User = Depends(get_current_user),
) -> TimelineListResponse:
    """
    タイムライン一覧取得 API

    現在のユーザーが作成したタイムライン一覧を取得します。
    """
    timelines = await Timeline.filter(user=current_user).prefetch_related(
        'target_accounts'
    )

    timeline_responses = []
    for timeline in timelines:
        timeline_responses.append(await create_timeline_response(timeline))

    return TimelineListResponse(
        timelines=timeline_responses,
        total=len(timeline_responses),
    )


@router.get('/{timeline_id}', response_model=TimelineResponse)
async def TimelineDetailAPI(
    timeline_id: int,
    current_user: User = Depends(get_current_user),
) -> TimelineResponse:
    """
    タイムライン詳細取得 API

    指定された ID のタイムライン詳細情報を取得します。
    """
    timeline = (
        await Timeline.filter(
            id=timeline_id,
            user=current_user,
        )
        .prefetch_related('target_accounts')
        .first()
    )

    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたタイムラインが見つかりません',
        )

    return await create_timeline_response(timeline)


@router.put('/{timeline_id}', response_model=TimelineResponse)
async def TimelineUpdateAPI(
    timeline_id: int,
    request: TimelineUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> TimelineResponse:
    """
    タイムライン更新 API

    指定されたタイムラインの設定を更新します。
    """
    timeline = (
        await Timeline.filter(
            id=timeline_id,
            user=current_user,
        )
        .prefetch_related('target_accounts')
        .first()
    )

    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたタイムラインが見つかりません',
        )

    # 更新フィールドを適用
    if request.name is not None:
        timeline.name = request.name
    if request.description is not None:
        timeline.description = request.description
    if request.is_active is not None:
        timeline.is_active = request.is_active

    # デフォルトタイムラインの場合、既存のデフォルトを無効化
    if request.is_default is not None:
        if request.is_default:
            await Timeline.filter(user=current_user, is_default=True).update(
                is_default=False
            )
        timeline.is_default = request.is_default

    # ターゲットアカウントの更新
    if request.target_account_ids is not None:
        # ターゲットアカウントの存在確認
        target_accounts = await TargetAccount.filter(
            id__in=request.target_account_ids,
            user=current_user,
        ).all()

        if len(target_accounts) != len(request.target_account_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='指定されたターゲットアカウントの一部が見つかりません',
            )

        # 既存の関連を削除し、新しい関連を追加
        await timeline.target_accounts.clear()
        await timeline.target_accounts.add(*target_accounts)

    await timeline.save()

    return await create_timeline_response(timeline)


@router.delete('/{timeline_id}')
async def TimelineDeleteAPI(
    timeline_id: int,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    タイムライン削除 API

    指定されたタイムラインを削除します。
    """
    timeline = await Timeline.filter(
        id=timeline_id,
        user=current_user,
    ).first()

    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたタイムラインが見つかりません',
        )

    await timeline.delete()

    return {'message': 'タイムラインを削除しました'}


@router.get('/{timeline_id}/tweets', response_model=TimelineTweetsResponse)
async def TimelineTweetsAPI(
    timeline_id: int,
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description='ページ番号'),
    page_size: int = Query(20, ge=1, le=100, description='1ページあたりのツイート数'),
) -> TimelineTweetsResponse:
    """
    タイムライン内ツイート取得 API

    指定されたタイムラインに含まれるターゲットアカウントからのツイートを取得します。
    """
    # タイムライン存在確認
    timeline = (
        await Timeline.filter(
            id=timeline_id,
            user=current_user,
            is_active=True,
        )
        .prefetch_related('target_accounts')
        .first()
    )

    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたタイムラインが見つかりません',
        )

    # タイムラインに含まれるターゲットアカウントIDを取得
    target_account_ids = [
        account.id for account in await timeline.target_accounts.all()
    ]

    if not target_account_ids:
        # ターゲットアカウントが設定されていない場合
        timeline_response = await create_timeline_response(timeline)
        return TimelineTweetsResponse(
            timeline=timeline_response,
            tweets=[],
            total=0,
            page=page,
            page_size=page_size,
            has_next=False,
        )

    # ツイート一覧を取得（ページネーション付き）
    # is_quoted=False のツイートのみを取得（引用元ツイートを除外）
    offset = (page - 1) * page_size
    tweets_query = (
        Tweet.filter(target_account_id__in=target_account_ids, is_quoted=False)
        .select_related('target_account')
        .order_by('-posted_at')
    )

    # 総数を取得
    total_tweets = await tweets_query.count()

    # ページネーション適用
    tweets = await tweets_query.offset(offset).limit(page_size).all()

    # 次のページが存在するかチェック
    has_next = offset + page_size < total_tweets

    # レスポンス生成
    tweet_responses = []
    for tweet in tweets:
        tweet_response = await create_tweet_response(tweet, current_user)
        tweet_responses.append(tweet_response)

    timeline_response = await create_timeline_response(timeline)

    return TimelineTweetsResponse(
        timeline=timeline_response,
        tweets=tweet_responses,
        total=total_tweets,
        page=page,
        page_size=page_size,
        has_next=has_next,
    )
