from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from tortoise.exceptions import IntegrityError

from app.models.user import User
from app.utils.auth import hash_password

router = APIRouter(prefix='/api/v1/users', tags=['users'])


class UserCreateRequest(BaseModel):
    """ユーザー作成リクエスト"""

    email: str
    username: str
    password: str


class UserUpdateRequest(BaseModel):
    """ユーザー更新リクエスト"""

    email: str | None = None
    username: str | None = None


class UserResponse(BaseModel):
    """ユーザーレスポンス（パスワードハッシュを除く）"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    is_active: bool
    is_admin: bool
    created_at: Any
    updated_at: Any


@router.get('', response_model=list[UserResponse])
async def UserListAPI() -> list[UserResponse]:
    """ユーザー一覧取得API"""
    users = await User.all()
    return [UserResponse.model_validate(user) for user in users]


@router.post('', response_model=UserResponse, status_code=201)
async def UserCreateAPI(request: UserCreateRequest) -> UserResponse:
    """ユーザー作成API"""
    try:
        # パスワードをハッシュ化
        password_hash = hash_password(request.password)

        # ユーザーを作成
        user = await User.create(
            email=request.email,
            username=request.username,
            password_hash=password_hash,
        )

        return UserResponse.model_validate(user)
    except IntegrityError as ex:
        # 重複エラーをハンドリング
        error_msg = str(ex).lower()
        if 'email' in error_msg:
            raise HTTPException(
                status_code=400, detail='Email address already exists'
            ) from ex
        elif 'username' in error_msg:
            raise HTTPException(
                status_code=400, detail='Username already exists'
            ) from ex
        else:
            raise HTTPException(status_code=400, detail='User creation failed') from ex


@router.get('/{user_id}', response_model=UserResponse)
async def UserDetailAPI(user_id: int) -> UserResponse:
    """ユーザー詳細取得API"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    return UserResponse.model_validate(user)


@router.put('/{user_id}', response_model=UserResponse)
async def UserUpdateAPI(user_id: int, request: UserUpdateRequest) -> UserResponse:
    """ユーザー更新API"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    # 更新するフィールドのみを適用
    update_data = {}
    if request.email is not None:
        update_data['email'] = request.email
    if request.username is not None:
        update_data['username'] = request.username

    try:
        # ユーザー情報を更新
        await user.update_from_dict(update_data)
        await user.save()

        return UserResponse.model_validate(user)
    except IntegrityError as ex:
        # 重複エラーをハンドリング
        error_msg = str(ex).lower()
        if 'email' in error_msg:
            raise HTTPException(
                status_code=400, detail='Email address already exists'
            ) from ex
        elif 'username' in error_msg:
            raise HTTPException(
                status_code=400, detail='Username already exists'
            ) from ex
        else:
            raise HTTPException(status_code=400, detail='User update failed') from ex


@router.delete('/{user_id}', status_code=204)
async def UserDeleteAPI(user_id: int) -> None:
    """ユーザー削除API"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    await user.delete()
