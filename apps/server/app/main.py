from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI

from app.database import close_db, init_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # 起動時の処理
    await init_db()
    yield
    # 終了時の処理
    await close_db()


app = FastAPI(lifespan=lifespan, title='Echo Bird API', version='0.1.0')


@app.get('/')
async def root() -> dict[str, Any]:
    return {'message': 'Hello World'}


@app.get('/health')
async def health_check() -> dict[str, str]:
    return {'status': 'ok'}
