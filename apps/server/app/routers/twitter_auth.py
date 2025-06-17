from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from app.models.twitter_account import TwitterAccount
from app.models.user import User
from app.utils.auth import get_current_user
from app.utils.twitter_auth import TwitterAuthService, AuthChallengeRequiredException

router = APIRouter(prefix='/api/v1/twitter', tags=['twitter_auth'])


class TwitterAuthRequest(BaseModel):
    """Twitter 認証リクエスト"""

    username: str = Field(..., description='Twitter ユーザー名 (@なし)')
    email: str = Field(..., description='Twitter メールアドレス')
    password: str = Field(..., description='Twitter パスワード')


class TwitterAccountResponse(BaseModel):
    """Twitter アカウント情報レスポンス"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description='アカウント ID')
    twitter_id: str = Field(..., description='Twitter ユーザー ID')
    username: str = Field(..., description='Twitter ユーザー名')
    display_name: str = Field(..., description='表示名')
    profile_image_url: str | None = Field(None, description='プロフィール画像 URL')
    bio: str | None = Field(None, description='プロフィール説明')
    followers_count: int = Field(..., description='フォロワー数')
    following_count: int = Field(..., description='フォロー数')
    is_active: bool = Field(..., description='アクティブ状態')
    status: str = Field(..., description='アカウントステータス')
    created_at: int = Field(..., description='作成日時 (Unix timestamp)')
    updated_at: int = Field(..., description='更新日時 (Unix timestamp)')
    last_login_at: int | None = Field(
        None, description='最終ログイン日時 (Unix timestamp)'
    )


class TwitterAuthResponse(BaseModel):
    """Twitter 認証レスポンス"""

    success: bool = Field(..., description='認証成功フラグ')
    message: str = Field(..., description='メッセージ')
    account: TwitterAccountResponse | None = Field(
        None, description='認証されたアカウント情報'
    )


class TwitterAuthInitResponse(BaseModel):
    """Twitter 初回認証レスポンス（認証チャレンジ検出付き）"""

    success: bool = Field(..., description='認証成功フラグ')
    message: str = Field(..., description='メッセージ')
    account: TwitterAccountResponse | None = Field(
        None, description='認証されたアカウント情報（チャレンジ不要の場合）'
    )
    needs_challenge: bool = Field(
        False, description='認証チャレンジコード入力が必要かどうか'
    )
    session_id: str | None = Field(
        None, description='認証セッション ID（チャレンジ必要の場合）'
    )
    prompt_message: str | None = Field(
        None, description='ユーザーに表示するプロンプトメッセージ（チャレンジ必要の場合）'
    )
    challenge_type: str | None = Field(
        None, description='チャレンジの種類（LoginAcid、LoginTwoFactorAuthChallenge など）'
    )


class TwitterChallengeRequest(BaseModel):
    """Twitter 認証チャレンジコード入力リクエスト"""

    session_id: str = Field(..., description='認証セッション ID')
    challenge_code: str = Field(
        ..., description='認証チャレンジコード（メールコード、TOTPコードなど）', min_length=1
    )


class TwitterAccountListResponse(BaseModel):
    """Twitter アカウント一覧レスポンス"""

    accounts: list[TwitterAccountResponse] = Field(
        ..., description='Twitter アカウント一覧'
    )
    total: int = Field(..., description='アカウント総数')


@router.post('/authenticate-init', response_model=TwitterAuthInitResponse)
async def TwitterAuthenticateInitAPI(
    request: TwitterAuthRequest,
    current_user: User = Depends(get_current_user),
) -> TwitterAuthInitResponse:
    """
    Twitter アカウント初回認証 API（TFA 検出付き）

    twikit を使用して Twitter アカウントの認証を開始します。
    TFA が不要な場合は認証完了、TFA が必要な場合はセッション ID を返します。
    """
    twitter_service = TwitterAuthService()

    (
        success,
        twitter_account,
        error_or_exception,
    ) = await twitter_service.authenticate_init(
        user=current_user,
        username=request.username,
        email=request.email,
        password=request.password,
    )

    # 認証チャレンジが必要な場合
    if isinstance(error_or_exception, AuthChallengeRequiredException):
        return TwitterAuthInitResponse(
            success=False,
            message='Authentication challenge required',
            account=None,
            needs_challenge=True,
            session_id=error_or_exception.session_id,
            prompt_message=error_or_exception.prompt_message,
            challenge_type=error_or_exception.challenge_type,
        )

    # 認証成功の場合
    if success and twitter_account:
        return TwitterAuthInitResponse(
            success=True,
            message='Twitter account authenticated successfully',
            account=TwitterAccountResponse.model_validate(twitter_account),
            needs_challenge=False,
            session_id=None,
            prompt_message=None,
            challenge_type=None,
        )

    # 認証失敗の場合
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=error_or_exception or 'Twitter authentication failed',
    )


@router.post('/authenticate-challenge', response_model=TwitterAuthResponse)
async def TwitterAuthenticateChallengeAPI(
    request: TwitterChallengeRequest,
    current_user: User = Depends(get_current_user),
) -> TwitterAuthResponse:
    """
    Twitter 認証チャレンジコード入力認証 API

    セッション ID と認証チャレンジコードを使用して Twitter 認証を完了します。
    """
    twitter_service = TwitterAuthService()

    (
        success,
        twitter_account,
        error_message,
    ) = await twitter_service.authenticate_challenge(
        session_id=request.session_id,
        challenge_code=request.challenge_code,
    )

    if success and twitter_account:
        return TwitterAuthResponse(
            success=True,
            message='Twitter account authenticated successfully with challenge',
            account=TwitterAccountResponse.model_validate(twitter_account),
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_message or 'Challenge authentication failed',
        )


@router.post('/authenticate', response_model=TwitterAuthResponse)
async def TwitterAuthenticateAPI(
    request: TwitterAuthRequest,
    current_user: User = Depends(get_current_user),
) -> TwitterAuthResponse:
    """
    【廃止予定】Twitter アカウント認証 API

    このエンドポイントは TFA 非対応の後方互換性のために残されています。
    新しい実装では /authenticate-init を使用してください。
    
    twikit を使用して Twitter アカウントを認証し、
    成功した場合はアカウント情報をデータベースに保存します。
    """
    twitter_service = TwitterAuthService()

    (
        success,
        twitter_account,
        error_message,
    ) = await twitter_service.authenticate_and_save(
        user=current_user,
        username=request.username,
        email=request.email,
        password=request.password,
    )

    if success and twitter_account:
        return TwitterAuthResponse(
            success=True,
            message='Twitter account authenticated successfully',
            account=TwitterAccountResponse.model_validate(twitter_account),
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_message or 'Twitter authentication failed',
        )


@router.get('/accounts', response_model=TwitterAccountListResponse)
async def TwitterAccountsListAPI(
    current_user: User = Depends(get_current_user),
) -> TwitterAccountListResponse:
    """
    Twitter アカウント一覧取得 API

    現在のユーザーに関連付けられた Twitter アカウント一覧を取得します。
    """
    accounts = await TwitterAccount.filter(user=current_user, is_active=True).all()

    return TwitterAccountListResponse(
        accounts=[
            TwitterAccountResponse.model_validate(account) for account in accounts
        ],
        total=len(accounts),
    )


@router.get('/accounts/{account_id}', response_model=TwitterAccountResponse)
async def TwitterAccountDetailAPI(
    account_id: int,
    current_user: User = Depends(get_current_user),
) -> TwitterAccountResponse:
    """
    Twitter アカウント詳細取得 API

    指定された ID の Twitter アカウント詳細情報を取得します。
    """
    account = await TwitterAccount.filter(
        id=account_id,
        user=current_user,
        is_active=True,
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定された Twitter アカウントが見つかりません',
        )

    return TwitterAccountResponse.model_validate(account)


@router.put('/accounts/{account_id}/refresh', response_model=TwitterAccountResponse)
async def TwitterAccountRefreshAPI(
    account_id: int,
    current_user: User = Depends(get_current_user),
) -> TwitterAccountResponse:
    """
    Twitter アカウント情報更新 API

    指定された Twitter アカウントの情報を最新の状態に更新します。
    """
    account = await TwitterAccount.filter(
        id=account_id,
        user=current_user,
        is_active=True,
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定された Twitter アカウントが見つかりません',
        )

    twitter_service = TwitterAuthService()
    success = await twitter_service.refresh_account_info(account)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Twitter アカウント情報の更新に失敗しました',
        )

    # 更新後のアカウント情報を再取得
    refreshed_account = await TwitterAccount.get(id=account_id)
    return TwitterAccountResponse.model_validate(refreshed_account)


@router.delete('/accounts/{account_id}')
async def TwitterAccountDeleteAPI(
    account_id: int,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Twitter アカウント削除 API

    指定された Twitter アカウントを削除（非アクティブ化）します。
    """
    account = await TwitterAccount.filter(
        id=account_id,
        user=current_user,
        is_active=True,
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='指定された Twitter アカウントが見つかりません',
        )

    # 論理削除（非アクティブ化）
    account.is_active = False
    await account.save()

    return {'message': 'Twitter アカウントを削除しました'}
