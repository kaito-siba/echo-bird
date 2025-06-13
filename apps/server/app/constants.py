"""
EchoBird プロジェクトの定数定義

このファイルには、プロジェクト全体で使用される定数を
カテゴリ別に整理して定義しています。
"""

# ==========================================
# データベース関連定数
# ==========================================

# デフォルトのデータベース URL
DEFAULT_DATABASE_URL = 'postgres://postgres:password@localhost:5432/echo_bird'


# ==========================================
# 認証・セキュリティ関連定数
# ==========================================

# JWT 設定
JWT_ALGORITHM = 'HS256'
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_SECRET_KEY = 'your-secret-key-here'  # 本番環境では環境変数から取得


# ==========================================
# モデルフィールド長制限定数
# ==========================================

# 汎用フィールド長
FIELD_LENGTH_SMALL = 50  # ID、コード類
FIELD_LENGTH_MEDIUM = 255  # 名前、メール、ユーザー名
FIELD_LENGTH_LARGE = 500  # URL、パス、トークン類
FIELD_LENGTH_XLARGE = 1000  # 長いテキスト

# メディア関連フィールド長
MEDIA_KEY_LENGTH = 100  # メディアキー

# 特定用途フィールド長
LANGUAGE_CODE_LENGTH = 10  # 言語コード
MEDIA_TYPE_LENGTH = 20  # メディアタイプ
USERNAME_MAX_LENGTH = 255  # ユーザー名
EMAIL_MAX_LENGTH = 255  # メールアドレス
PASSWORD_HASH_LENGTH = 255  # パスワードハッシュ
URL_MAX_LENGTH = 500  # URL フィールド
TOKEN_MAX_LENGTH = 500  # 認証トークン類
TWITTER_ID_LENGTH = 50  # Twitter ID


# ==========================================
# デフォルト値定数
# ==========================================

# 数値系デフォルト値
DEFAULT_COUNT = 0
DEFAULT_INTERVAL_MINUTES = 60
DEFAULT_MAX_TWEETS_PER_FETCH = 100

# 真偽値系デフォルト値
DEFAULT_IS_ACTIVE = True
DEFAULT_IS_ADMIN = False
DEFAULT_IS_LOGGED_IN = False
DEFAULT_IS_SUSPENDED = False
DEFAULT_IS_LOCKED = False
DEFAULT_IS_RETWEET = False
DEFAULT_IS_QUOTE = False
DEFAULT_IS_REPLY = False
DEFAULT_HAS_MEDIA = False
DEFAULT_IS_POSSIBLY_SENSITIVE = False
DEFAULT_IS_VERIFIED = False
DEFAULT_IS_PROTECTED = False


# ==========================================
# ステータス関連定数
# ==========================================

# メディアダウンロードステータス
MEDIA_STATUS_PENDING = 'pending'
MEDIA_STATUS_DOWNLOADING = 'downloading'
MEDIA_STATUS_COMPLETED = 'completed'
MEDIA_STATUS_FAILED = 'failed'

# Twitter アカウントステータス
TWITTER_ACCOUNT_STATUS_ACTIVE = 'Active'
TWITTER_ACCOUNT_STATUS_SUSPENDED = 'Suspended'


# ==========================================
# API 関連定数
# ==========================================

# API バージョン
API_VERSION_V1 = 'v1'
API_PREFIX = f'/api/{API_VERSION_V1}'

# API レスポンスメッセージ
API_RESPONSE_HELLO = 'Hello World'
API_RESPONSE_HEALTH_OK = 'ok'


# ==========================================
# アプリケーション情報
# ==========================================

# アプリケーション基本情報
APP_NAME = 'Echo Bird API'
APP_VERSION = '0.1.0'


# ==========================================
# データベーステーブル名
# ==========================================

# テーブル名定数（Tortoise ORM の Meta クラスで使用）
TABLE_USERS = 'users'
TABLE_TWEETS = 'tweets'
TABLE_READ_TWEETS = 'read_tweets'
TABLE_BOOKMARKED_TWEETS = 'bookmarked_tweets'
TABLE_TWITTER_ACCOUNTS = 'twitter_accounts'
TABLE_TARGET_ACCOUNTS = 'target_accounts'
TABLE_MEDIA = 'media'
