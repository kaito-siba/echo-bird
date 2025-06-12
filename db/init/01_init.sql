-- Echo Bird データベース初期化スクリプト
-- データベースが存在しない場合は作成（Docker環境では既に作成済み）
-- CREATE DATABASE IF NOT EXISTS echo_bird;
-- 日本語全文検索用の拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- タイムゾーンを設定
SET
  timezone = 'Asia/Tokyo';

-- デフォルトのテキスト検索設定を日本語に設定（将来的な全文検索機能用）
-- ALTER DATABASE echo_bird SET default_text_search_config = 'pg_catalog.japanese';