from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOL NOT NULL DEFAULT True,
    "is_admin" BOOL NOT NULL DEFAULT False,
    "created_at" INT NOT NULL,
    "updated_at" INT NOT NULL
);
COMMENT ON TABLE "users" IS 'EchoBird アプリケーションのユーザー情報を管理するモデル';
CREATE TABLE IF NOT EXISTS "target_accounts" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "twitter_user_id" VARCHAR(50) NOT NULL UNIQUE,
    "username" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255),
    "description" TEXT,
    "location" VARCHAR(255),
    "url" VARCHAR(500),
    "profile_image_url" VARCHAR(500),
    "profile_banner_url" VARCHAR(500),
    "is_active" BOOL NOT NULL DEFAULT True,
    "is_protected" BOOL NOT NULL DEFAULT False,
    "is_verified" BOOL NOT NULL DEFAULT False,
    "is_blue_verified" BOOL NOT NULL DEFAULT False,
    "followers_count" INT NOT NULL DEFAULT 0,
    "following_count" INT NOT NULL DEFAULT 0,
    "tweets_count" INT NOT NULL DEFAULT 0,
    "listed_count" INT NOT NULL DEFAULT 0,
    "favorites_count" INT NOT NULL DEFAULT 0,
    "last_fetched_at" INT,
    "last_tweet_id" VARCHAR(50),
    "fetch_interval_minutes" INT NOT NULL DEFAULT 60,
    "max_tweets_per_fetch" INT NOT NULL DEFAULT 100,
    "consecutive_errors" INT NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "last_error_at" INT,
    "account_created_at" INT,
    "created_at" INT NOT NULL,
    "updated_at" INT NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
COMMENT ON TABLE "target_accounts" IS 'ツイート取得対象の Twitter アカウント情報を管理するモデル';
CREATE TABLE IF NOT EXISTS "tweets" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "tweet_id" VARCHAR(50) NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "full_text" TEXT,
    "lang" VARCHAR(10),
    "likes_count" INT NOT NULL DEFAULT 0,
    "retweets_count" INT NOT NULL DEFAULT 0,
    "replies_count" INT NOT NULL DEFAULT 0,
    "quotes_count" INT NOT NULL DEFAULT 0,
    "views_count" INT,
    "bookmark_count" INT,
    "is_retweet" BOOL NOT NULL DEFAULT False,
    "is_quote" BOOL NOT NULL DEFAULT False,
    "retweeted_tweet_id" VARCHAR(50),
    "quoted_tweet_id" VARCHAR(50),
    "is_reply" BOOL NOT NULL DEFAULT False,
    "in_reply_to_tweet_id" VARCHAR(50),
    "in_reply_to_user_id" VARCHAR(50),
    "conversation_id" VARCHAR(50),
    "hashtags" JSONB,
    "urls" JSONB,
    "user_mentions" JSONB,
    "is_possibly_sensitive" BOOL NOT NULL DEFAULT False,
    "has_media" BOOL NOT NULL DEFAULT False,
    "posted_at" INT NOT NULL,
    "created_at" INT NOT NULL,
    "updated_at" INT NOT NULL,
    "target_account_id" BIGINT NOT NULL REFERENCES "target_accounts" ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_tweets_target__9434fe" ON "tweets" ("target_account_id", "posted_at");
CREATE INDEX IF NOT EXISTS "idx_tweets_convers_2ab1f4" ON "tweets" ("conversation_id");
COMMENT ON TABLE "tweets" IS 'Twitter から twikit 経由で取得したツイートデータを管理するモデル';
CREATE TABLE IF NOT EXISTS "bookmarked_tweets" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "bookmarked_at" INT NOT NULL,
    "tweet_id" BIGINT NOT NULL REFERENCES "tweets" ("id") ON DELETE CASCADE,
    "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_bookmarked__user_id_d3ad98" UNIQUE ("user_id", "tweet_id")
);
COMMENT ON TABLE "bookmarked_tweets" IS 'ユーザーがブックマークしたツイートを管理するモデル';
CREATE TABLE IF NOT EXISTS "media" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "media_key" VARCHAR(100) NOT NULL UNIQUE,
    "media_type" VARCHAR(20) NOT NULL,
    "media_url" VARCHAR(500),
    "display_url" VARCHAR(500),
    "expanded_url" VARCHAR(500),
    "width" INT,
    "height" INT,
    "duration_ms" INT,
    "preview_image_url" VARCHAR(500),
    "variants" JSONB,
    "alt_text" TEXT,
    "additional_media_info" JSONB,
    "local_path" VARCHAR(500),
    "file_size" INT,
    "is_downloaded" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "download_attempts" INT NOT NULL DEFAULT 0,
    "downloaded_at" INT,
    "created_at" INT NOT NULL,
    "updated_at" INT NOT NULL,
    "tweet_id" BIGINT NOT NULL REFERENCES "tweets" ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_media_tweet_i_4fc89b" ON "media" ("tweet_id", "media_type");
CREATE INDEX IF NOT EXISTS "idx_media_is_down_b06743" ON "media" ("is_downloaded");
COMMENT ON TABLE "media" IS 'ツイートに添付されたメディア（画像・動画・GIF）を管理するモデル';
CREATE TABLE IF NOT EXISTS "read_tweets" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "read_at" INT NOT NULL,
    "tweet_id" BIGINT NOT NULL REFERENCES "tweets" ("id") ON DELETE CASCADE,
    "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_read_tweets_user_id_7ced1d" UNIQUE ("user_id", "tweet_id")
);
COMMENT ON TABLE "read_tweets" IS 'ユーザーが既読したツイートを管理するモデル';
CREATE TABLE IF NOT EXISTS "twitter_accounts" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "email" VARCHAR(255),
    "screen_name" VARCHAR(255),
    "password" VARCHAR(500) NOT NULL,
    "cookies" TEXT,
    "auth_token" VARCHAR(500),
    "ct0" VARCHAR(500),
    "twitter_user_id" VARCHAR(50) UNIQUE,
    "display_name" VARCHAR(255),
    "profile_image_url" VARCHAR(500),
    "is_active" BOOL NOT NULL DEFAULT True,
    "is_logged_in" BOOL NOT NULL DEFAULT False,
    "last_login_at" INT,
    "is_suspended" BOOL NOT NULL DEFAULT False,
    "is_locked" BOOL NOT NULL DEFAULT False,
    "rate_limit_exceeded_at" INT,
    "last_error" TEXT,
    "error_count" INT NOT NULL DEFAULT 0,
    "created_at" INT NOT NULL,
    "updated_at" INT NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
COMMENT ON TABLE "twitter_accounts" IS '認証用 Twitter アカウント情報を管理するモデル';
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
