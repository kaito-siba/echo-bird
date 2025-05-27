# バージョン
from pathlib import Path
import pkgutil
import secrets

from passlib.context import CryptContext
import httpx


VERSION = "0.12.0"

# ベースディレクトリ
BASE_DIR = Path(__file__).resolve().parent.parent

# クライアントの静的ファイルがあるディレクトリ
CLIENT_DIR = BASE_DIR.parent / "client/dist"

# データディレクトリ
DATA_DIR = BASE_DIR / "data"  # データベース (Tortoise ORM) の設定
## アカウントのアイコン画像があるディレクトリ
ACCOUNT_ICON_DIR = DATA_DIR / "account-icons"

# スタティックディレクトリ
STATIC_DIR = BASE_DIR / "static"
## ロゴファイルがあるディレクトリ
LOGO_DIR = STATIC_DIR / "logos"
## デフォルトのアイコン画像があるディレクトリ
ACCOUNT_ICON_DEFAULT_DIR = STATIC_DIR / "account-icons"

__model_list = [name for _, name, _ in pkgutil.iter_modules(path=["app/models"])]
DATABASE_CONFIG = {
    "timezone": "Asia/Tokyo",
    "connections": {
        "default": f'sqlite://{DATA_DIR / "database.sqlite"!s}',
    },
    "apps": {
        "models": {
            "models": [f"app.models.{name}" for name in __model_list]
            + ["aerich.models"],
            "default_connection": "default",
        }
    },
}

# 外部 API に送信するリクエストヘッダー
API_REQUEST_HEADERS: dict[str, str] = {
    "User-Agent": f"Echo Bird/{VERSION}",
}

# httpx.AsyncClient 自体は一度使ったら再利用できないので、httpx.AsyncClient を返す関数にしている
HTTPX_CLIENT = lambda: httpx.AsyncClient(
    # Echo Bird の User-Agent を指定
    headers=API_REQUEST_HEADERS,
    # リダイレクトを追跡する
    follow_redirects=True,
    # 3 秒応答がない場合はタイムアウトする
    timeout=3.0,
)

# JWT のエンコード/デコードに使うシークレットキー
## jwt_secret.dat がない場合は自動生成する
JWT_SECRET_KEY_PATH = DATA_DIR / "jwt_secret.dat"
if Path.exists(JWT_SECRET_KEY_PATH) is False:
    with open(JWT_SECRET_KEY_PATH, mode="w", encoding="utf-8") as file:
        file.write(secrets.token_hex(32))  # 32ビット (256文字) の乱数を書き込む
## jwt_secret.dat からシークレットキーをロードする
with open(JWT_SECRET_KEY_PATH, encoding="utf-8") as file:
    JWT_SECRET_KEY = file.read().strip()

# パスワードハッシュ化のための設定
PASSWORD_CONTEXT = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# TODO いずれ削除
# ニコニコ OAuth の Client ID
NICONICO_OAUTH_CLIENT_ID = "4JTJdyBZLwMJwaI7"
