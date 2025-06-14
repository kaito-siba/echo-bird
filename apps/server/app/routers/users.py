from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from tortoise.exceptions import IntegrityError

from app.models.user import User
from app.utils.auth import get_current_admin_user, hash_password

router = APIRouter(prefix='/api/v1/users', tags=['users'])


class UserCreateRequest(BaseModel):
    """ユーザー作成リクエスト"""

    username: str
    password: str


class UserUpdateRequest(BaseModel):
    """ユーザー更新リクエスト"""

    username: str | None = None
    is_active: bool | None = None
    is_admin: bool | None = None


class UserResponse(BaseModel):
    """ユーザーレスポンス（パスワードハッシュを除く）"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    is_active: bool
    is_admin: bool
    created_at: int  # Unix timestamp
    updated_at: int  # Unix timestamp


@router.get('', response_model=list[UserResponse])
async def UserListAPI(
    _admin_user: User = Depends(get_current_admin_user),
) -> list[UserResponse]:
    """ユーザー一覧取得API（管理者のみ）"""
    users = await User.all()
    return [UserResponse.model_validate(user) for user in users]


@router.post('', response_model=UserResponse, status_code=201)
async def UserCreateAPI(
    request: UserCreateRequest,
    _admin_user: User = Depends(get_current_admin_user),
) -> UserResponse:
    """ユーザー作成API（管理者のみ）"""
    try:
        # パスワードをハッシュ化
        password_hash = hash_password(request.password)

        # ユーザーを作成
        user = await User.create(
            username=request.username,
            password_hash=password_hash,
        )

        return UserResponse.model_validate(user)
    except IntegrityError as ex:
        # 重複エラーをハンドリング
        error_msg = str(ex).lower()
        if 'username' in error_msg:
            raise HTTPException(
                status_code=400, detail='Username already exists'
            ) from ex
        else:
            raise HTTPException(status_code=400, detail='User creation failed') from ex


@router.get('/{user_id}', response_model=UserResponse)
async def UserDetailAPI(
    user_id: int,
    _admin_user: User = Depends(get_current_admin_user),
) -> UserResponse:
    """ユーザー詳細取得API（管理者のみ）"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    return UserResponse.model_validate(user)


@router.put('/{user_id}', response_model=UserResponse)
async def UserUpdateAPI(
    user_id: int,
    request: UserUpdateRequest,
    _admin_user: User = Depends(get_current_admin_user),
) -> UserResponse:
    """ユーザー更新API（管理者のみ）"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    # 更新するフィールドのみを適用
    update_data = {}
    if request.username is not None:
        update_data['username'] = request.username
    if request.is_active is not None:
        update_data['is_active'] = request.is_active
    if request.is_admin is not None:
        update_data['is_admin'] = request.is_admin

    try:
        # ユーザー情報を更新
        await user.update_from_dict(update_data)
        await user.save()

        return UserResponse.model_validate(user)
    except IntegrityError as ex:
        # 重複エラーをハンドリング
        error_msg = str(ex).lower()
        if 'username' in error_msg:
            raise HTTPException(
                status_code=400, detail='Username already exists'
            ) from ex
        else:
            raise HTTPException(status_code=400, detail='User update failed') from ex


@router.delete('/{user_id}', status_code=204)
async def UserDeleteAPI(
    user_id: int,
    _admin_user: User = Depends(get_current_admin_user),
) -> None:
    """ユーザー削除API（管理者のみ）"""
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    await user.delete()
