from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.user import User

# JWT設定
SECRET_KEY = 'your-secret-key-here'  # 本番環境では環境変数から取得
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# HTTP Bearer認証スキーム
security = HTTPBearer()


def hash_password(password: str) -> str:
    """パスワードをbcryptでハッシュ化する"""
    # パスワードをUTF-8でエンコードしてバイト文字列にする
    password_bytes = password.encode('utf-8')
    # saltを生成してハッシュ化
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # str型で返す
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """bcryptでパスワードを検証する"""
    # パスワードとハッシュをバイト文字列に変換
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    # bcryptで検証
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """JWTアクセストークンを作成する"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any]:
    """JWTトークンを検証し、ペイロードを返す"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token has expired',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Could not validate credentials',
            headers={'WWW-Authenticate': 'Bearer'},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """現在のユーザーを取得する（JWT認証）"""
    token = credentials.credentials
    payload = verify_token(token)

    user_id = payload.get('sub')
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Could not validate credentials',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    user = await User.filter(id=int(user_id), is_active=True).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    return user


async def authenticate_user(username: str, password: str) -> User | None:
    """ユーザーを認証する（username でログイン）"""
    # ユーザー名でユーザーを検索
    user = await User.filter(username=username, is_active=True).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user
