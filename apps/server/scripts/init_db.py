#!/usr/bin/env python3
"""
データベース初期化スクリプト
"""

import asyncio
import os
import sys

# パスを追加してappをインポート可能にする
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import close_db, init_db
from app.models.user import User
from app.utils.auth import hash_password


async def create_admin_user():
    """
    adminユーザーを作成する
    環境変数から設定を読み取る:
    - ADMIN_USERNAME: 管理者ユーザー名 (デフォルト: admin)
    - ADMIN_PASSWORD: 管理者パスワード (デフォルト: admin123)
    """
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')

    # 既存のadminユーザーをチェック
    existing_admin = await User.filter(username=admin_username).first()
    if existing_admin:
        print(f'✅ adminユーザー "{admin_username}" は既に存在します')
        return

    # adminユーザーを作成
    password_hash = hash_password(admin_password)

    admin_user = User(
        username=admin_username,
        password_hash=password_hash,
        is_active=True,
        is_admin=True,
    )

    await admin_user.save()
    print(f'✅ adminユーザー "{admin_username}" を作成しました')

    # 本番環境での注意喚起
    if admin_password == 'admin123':
        print(
            '⚠️  デフォルトパスワードが使用されています。本番環境では ADMIN_PASSWORD 環境変数を設定してください。'
        )


async def main():
    """メイン処理"""
    try:
        print('データベースを初期化中...')
        await init_db()
        print('✅ データベースの初期化が完了しました!')

        print('\nadminユーザーを作成中...')
        await create_admin_user()

    except Exception as e:
        print(f'❌ エラーが発生しました: {e}')
        sys.exit(1)

    finally:
        await close_db()


if __name__ == '__main__':
    asyncio.run(main())
