from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from app.models.target_account import TargetAccount
from app.models.twitter_account import TwitterAccount
from app.models.user import User
from app.utils.auth import get_current_user
from app.utils.twitter_service import TwitterService

router = APIRouter(prefix='/api/v1/target-accounts', tags=['target_accounts'])


class TargetAccountCreateRequest(BaseModel):
    """ターゲットアカウント作成リクエスト"""

    username: str = Field(
        ..., description='追加するTwitterアカウントのユーザー名 (@なし)'
    )
    twitter_account_id: int = Field(
        ..., description='ツイート取得に使用するTwitterアカウントID'
    )
    fetch_interval_minutes: int = Field(60, description='取得間隔（分）', ge=5, le=1440)
    max_tweets_per_fetch: int = Field(
        20, description='一度に取得する最大ツイート数', ge=1, le=100
    )


class TargetAccountUpdateRequest(BaseModel):
    """ターゲットアカウント更新リクエスト"""

    is_active: bool | None = Field(None, description='アクティブ状態')
    fetch_interval_minutes: int | None = Field(
        None, description='取得間隔（分）', ge=5, le=1440
    )
    max_tweets_per_fetch: int | None = Field(
        None, description='一度に取得する最大ツイート数', ge=1, le=100
    )


class TargetAccountResponse(BaseModel):
    """ターゲットアカウント情報レスポンス"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description='ターゲットアカウント ID')
    twitter_user_id: str = Field(..., description='Twitter ユーザー ID')
    username: str = Field(..., description='Twitter ユーザー名')
    display_name: str | None = Field(None, description='表示名')
    description: str | None = Field(None, description='自己紹介文')
    location: str | None = Field(None, description='場所')
    url: str | None = Field(None, description='プロフィール URL')
    profile_image_url: str | None = Field(None, description='プロフィール画像 URL')
    profile_banner_url: str | None = Field(None, description='ヘッダー画像 URL')
    is_active: bool = Field(..., description='アクティブ状態')
    is_protected: bool = Field(..., description='非公開アカウントかどうか')
    is_verified: bool = Field(..., description='認証済みアカウントかどうか')
    is_blue_verified: bool = Field(..., description='Twitter Blue 認証')
    followers_count: int = Field(..., description='フォロワー数')
    following_count: int = Field(..., description='フォロー数')
    tweets_count: int = Field(..., description='ツイート数')
    listed_count: int = Field(..., description='リストに追加されている数')
    favorites_count: int = Field(..., description='いいね数')
    last_fetched_at: int | None = Field(
        None, description='最後にツイートを取得した日時（Unix timestamp）'
    )
    last_tweet_id: str | None = Field(None, description='最後に取得したツイート ID')
    fetch_interval_minutes: int = Field(..., description='取得間隔（分）')
    max_tweets_per_fetch: int = Field(..., description='一度に取得する最大ツイート数')
    consecutive_errors: int = Field(..., description='連続エラー回数')
    last_error: str | None = Field(None, description='最後のエラーメッセージ')
    last_error_at: int | None = Field(
        None, description='最後のエラー発生日時（Unix timestamp）'
    )
    account_created_at: int | None = Field(
        None, description='Twitter アカウント作成日（Unix timestamp）'
    )
    created_at: int = Field(..., description='レコード作成日時（Unix timestamp）')
    updated_at: int = Field(..., description='レコード更新日時（Unix timestamp）')


class TargetAccountListResponse(BaseModel):
    """ターゲットアカウント一覧レスポンス"""

    accounts: list[TargetAccountResponse] = Field(
        ..., description='ターゲットアカウント一覧'
    )
    total: int = Field(..., description='アカウント総数')


class TargetAccountCreateResponse(BaseModel):
    """ターゲットアカウント作成レスポンス"""

    success: bool = Field(..., description='作成成功フラグ')
    message: str = Field(..., description='メッセージ')
    account: TargetAccountResponse | None = Field(
        None, description='作成されたターゲットアカウント情報'
    )


@router.post('', response_model=TargetAccountCreateResponse)
async def TargetAccountCreateAPI(
    request: TargetAccountCreateRequest,
    current_user: User = Depends(get_current_user),
) -> TargetAccountCreateResponse:
    """
    ターゲットアカウント作成 API

    指定されたTwitterアカウントをターゲットアカウントとして追加し、
    ツイート取得対象に設定します。
    """
    # TwitterAccount の存在確認
    twitter_account = await TwitterAccount.filter(
        id=request.twitter_account_id,
        user=current_user,
        is_active=True,
    ).first()

    if not twitter_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定された Twitter アカウントが見つかりません',
        )

    # TwitterService を使用してターゲットアカウント情報を取得
    twitter_service = TwitterService()
    (
        success,
        target_account_info,
        error_message,
    ) = await twitter_service.get_user_info_and_save(
        twitter_account=twitter_account,
        target_username=request.username,
        current_user=current_user,
        fetch_interval_minutes=request.fetch_interval_minutes,
        max_tweets_per_fetch=request.max_tweets_per_fetch,
    )

    if success and target_account_info:
        return TargetAccountCreateResponse(
            success=True,
            message='ターゲットアカウントの追加が完了しました',
            account=TargetAccountResponse.model_validate(target_account_info),
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message or 'ターゲットアカウントの追加に失敗しました',
        )


@router.get('', response_model=TargetAccountListResponse)
async def TargetAccountListAPI(
    current_user: User = Depends(get_current_user),
) -> TargetAccountListResponse:
    """
    ターゲットアカウント一覧取得 API

    現在のユーザーに関連付けられたターゲットアカウント一覧を取得します。
    """
    accounts = await TargetAccount.filter(user=current_user).all()

    return TargetAccountListResponse(
        accounts=[
            TargetAccountResponse.model_validate(account) for account in accounts
        ],
        total=len(accounts),
    )


@router.get('/{account_id}', response_model=TargetAccountResponse)
async def TargetAccountDetailAPI(
    account_id: int,
    current_user: User = Depends(get_current_user),
) -> TargetAccountResponse:
    """
    ターゲットアカウント詳細取得 API

    指定された ID のターゲットアカウント詳細情報を取得します。
    """
    account = await TargetAccount.filter(
        id=account_id,
        user=current_user,
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたターゲットアカウントが見つかりません',
        )

    return TargetAccountResponse.model_validate(account)


@router.put('/{account_id}', response_model=TargetAccountResponse)
async def TargetAccountUpdateAPI(
    account_id: int,
    request: TargetAccountUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> TargetAccountResponse:
    """
    ターゲットアカウント更新 API

    指定されたターゲットアカウントの設定を更新します。
    """
    account = await TargetAccount.filter(
        id=account_id,
        user=current_user,
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたターゲットアカウントが見つかりません',
        )

    # 更新フィールドを適用
    if request.is_active is not None:
        account.is_active = request.is_active
    if request.fetch_interval_minutes is not None:
        account.fetch_interval_minutes = request.fetch_interval_minutes
    if request.max_tweets_per_fetch is not None:
        account.max_tweets_per_fetch = request.max_tweets_per_fetch

    await account.save()

    return TargetAccountResponse.model_validate(account)


@router.delete('/{account_id}')
async def TargetAccountDeleteAPI(
    account_id: int,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    ターゲットアカウント削除 API

    指定されたターゲットアカウントを削除します。
    """
    account = await TargetAccount.filter(
        id=account_id,
        user=current_user,
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたターゲットアカウントが見つかりません',
        )

    await account.delete()

    return {'message': 'ターゲットアカウントを削除しました'}


@router.post('/{account_id}/fetch-tweets')
async def TargetAccountFetchTweetsAPI(
    account_id: int,
    current_user: User = Depends(get_current_user),
) -> dict[str, str | int]:
    """
    ターゲットアカウントのツイート取得 API

    指定されたターゲットアカウントのツイートを手動で取得します。
    """
    target_account = await TargetAccount.filter(
        id=account_id,
        user=current_user,
    ).first()

    if not target_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定されたターゲットアカウントが見つかりません',
        )

    # アクティブな TwitterAccount を取得（最初の1つを使用）
    twitter_account = await TwitterAccount.filter(
        user=current_user,
        is_active=True,
    ).first()

    if not twitter_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='アクティブな Twitter アカウントが見つかりません',
        )

    # TwitterService を使用してツイートを取得
    twitter_service = TwitterService()
    fetched_count = await twitter_service.fetch_user_tweets(
        twitter_account=twitter_account,
        target_account=target_account,
    )

    return {
        'message': 'ツイート取得が完了しました',
        'fetched_count': fetched_count,
    }
