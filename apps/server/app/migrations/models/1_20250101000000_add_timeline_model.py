from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "timelines" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOL NOT NULL DEFAULT True,
    "is_default" BOOL NOT NULL DEFAULT False,
    "created_at" INT NOT NULL,
    "updated_at" INT NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
COMMENT ON TABLE "timelines" IS 'ユーザーがカスタム作成するタイムライン（フィード）を管理するモデル';
CREATE TABLE IF NOT EXISTS "timeline_target_accounts" (
    "timeline_id" BIGINT NOT NULL REFERENCES "timelines" ("id") ON DELETE CASCADE,
    "targetaccount_id" BIGINT NOT NULL REFERENCES "target_accounts" ("id") ON DELETE CASCADE
);
"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "timeline_target_accounts";
        DROP TABLE IF EXISTS "timelines";
    """
