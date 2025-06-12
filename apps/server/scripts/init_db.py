#!/usr/bin/env python3
"""
データベース初期化スクリプト
"""

import asyncio
import os
import sys

# パスを追加してsrcをインポート可能にする
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.database import close_db, init_db


async def main():
    """メイン処理"""
    try:
        print("データベースを初期化中...")
        await init_db()
        print("✅ データベースの初期化が完了しました!")

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        sys.exit(1)

    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
