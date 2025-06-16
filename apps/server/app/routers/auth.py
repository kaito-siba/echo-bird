from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from app.constants import API_PREFIX, JWT_ACCESS_TOKEN_EXPIRE_MINUTES
from app.models.user import User
from app.utils.auth import authenticate_user, create_access_token, get_current_user

router = APIRouter(prefix=f'{API_PREFIX}/auth', tags=['auth'])


class LoginRequest(BaseModel):
    """ログインリクエスト"""

    username: str
    password: str


class TokenResponse(BaseModel):
    """トークンレスポンス"""

    access_token: str
    token_type: str


class UserMeResponse(BaseModel):
    """現在のユーザー情報レスポンス"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    is_active: bool
    is_admin: bool
    created_at: int  # Unix timestamp
    updated_at: int  # Unix timestamp


@router.post('/login', response_model=TokenResponse)
async def LoginAPI(request: LoginRequest) -> TokenResponse:
    """ログインAPI"""
    user = await authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': str(user.id)}, expires_delta=access_token_expires
    )

    return TokenResponse(access_token=access_token, token_type='bearer')


@router.get('/me', response_model=UserMeResponse)
async def UserMeAPI(current_user: User = Depends(get_current_user)) -> UserMeResponse:
    """現在のユーザー情報取得API（認証が必要）"""
    return UserMeResponse.model_validate(current_user)
