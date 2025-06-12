import os

from tortoise import Tortoise

# 環境変数からデータベースURLを取得（デフォルトはローカル開発用）
DATABASE_URL = os.getenv(
    'DATABASE_URL', 'postgres://postgres:password@localhost:5432/echo_bird'
)

TORTOISE_ORM = {
    'connections': {'default': DATABASE_URL},
    'apps': {
        'models': {
            'models': ['src.models', 'aerich.models'],
            'default_connection': 'default',
        },
    },
}


async def init_db():
    """データベース初期化"""
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()


async def close_db():
    """データベース接続終了"""
    await Tortoise.close_connections()
