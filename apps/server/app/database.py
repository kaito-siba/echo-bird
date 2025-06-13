import os
import pkgutil

from tortoise import Tortoise

from app.constants import DEFAULT_DATABASE_URL

# 環境変数からデータベースURLを取得（デフォルトはローカル開発用）
DATABASE_URL = os.getenv('DATABASE_URL', DEFAULT_DATABASE_URL)

__model_list = [name for _, name, _ in pkgutil.iter_modules(path=['app/models'])]
TORTOISE_ORM = {
    'connections': {'default': DATABASE_URL},
    'apps': {
        'models': {
            'models': [f'app.models.{name}' for name in __model_list]
            + ['aerich.models'],
            'default_connection': 'default',
        }
    },
}


async def init_db():
    """データベース初期化"""
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()


async def close_db():
    """データベース接続終了"""
    await Tortoise.close_connections()
