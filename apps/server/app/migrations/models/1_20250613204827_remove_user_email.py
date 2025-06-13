from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP INDEX IF EXISTS "uid_users_email_133a6f";
        ALTER TABLE "users" DROP COLUMN "email";"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "users" ADD "email" VARCHAR(255) NOT NULL UNIQUE;
        CREATE UNIQUE INDEX IF NOT EXISTS "uid_users_email_133a6f" ON "users" ("email");"""
