# 設計書

## **1. 概要**

本システムは、Twitter の非公開リストのツイートを Web API 経由で取得し、 ハリボテの Twitter 風フロントエンドで表示・操作するもの。

## **2. 機能要件**

### **2.1 Tweet 取得機能**

- Twitter の非公開リストのツイートを取得する

- 取得するデータ:

  - ツイート本文

  - アカウント名

  - アカウントの URL

  - アカウントのアイコン URL

  - ツイート本文の URL

  - いいね数

  - リツイート数

  - 投稿日時

### **2.2 フロントエンド機能**

- ツイート一覧の表示（Twitter 風 UI）

- **フィルタリング機能**

  - 投稿期間のフィルタリング

  - キーワード検索

- **ソート機能**

  - いいね数順

  - リツイート数順

- **既読管理機能**

  - 既読ツイートは透明度を下げる

- **ブックマーク機能**

  - ツイートを保存・削除

- **将来的な拡張**（後で実装予定）

  - 音声読み上げ機能（Web Speech API）

  - ツイート要約機能（LLM or sumy）

## **3. システム構成**

### **3.1 使用技術**

| 要素             | 技術                 |
| ---------------- | -------------------- |
| フロントエンド   | React + Tailwind CSS |
| バックエンド     | FastAPI              |
| データベース     | PostgreSQL           |
| スクレイピング   | Twitter Web API      |
| スケジューリング | cron（定期実行）     |

### **3.2 データフロー**

1. **Tweet 取得処理**

   - ブラウザのリクエストを模倣して Twitter にログインし、cookie を取得する。それを利用して非公開リストのツイートを取得する。

   - 上記実装には tweepy-authlib を使用し、その使用法は KonomiTV を参考にする。

   - 取得したデータを PostgreSQL に保存する。

2. **フロントエンド処理**

   - ユーザーがアクセスすると PostgreSQL からツイートデータを取得。

   - フィルタリング・ソート・ブックマークなどの操作を可能にする。

3. **要約・音声読み上げ処理（後で追加）**

   - PostgreSQL からデータを取得し、sumy or LLM で要約。

   - Web Speech API を利用して音声読み上げを実装。

## **4. データ設計（PostgreSQL）**

### **4.1 テーブル設計**

#### users テーブル

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    twitter_user_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    profile_url VARCHAR(500),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### tweets テーブル

```sql
CREATE TABLE tweets (
    id BIGSERIAL PRIMARY KEY,
    tweet_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tweet_url VARCHAR(500),
    likes_count INTEGER DEFAULT 0,
    retweets_count INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **4.2 インデックス**

```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_tweets_posted_at ON tweets(posted_at DESC);
CREATE INDEX idx_tweets_is_read ON tweets(is_read);
CREATE INDEX idx_tweets_is_bookmarked ON tweets(is_bookmarked);
CREATE INDEX idx_tweets_user_id ON tweets(user_id);
CREATE INDEX idx_tweets_content_search ON tweets USING gin(to_tsvector('japanese', content));
```

### **4.3 データ例**

#### users テーブル

| id  | twitter_user_id | username | display_name | profile_url                 | profile_image_url                            |
| --- | --------------- | -------- | ------------ | --------------------------- | -------------------------------------------- |
| 1   | 123456789       | example  | Example User | https://twitter.com/example | https://pbs.twimg.com/profile_images/xxx.jpg |

#### tweets テーブル

| id  | tweet_id  | user_id | content                    | likes_count | retweets_count | posted_at              | is_read | is_bookmarked |
| --- | --------- | ------- | -------------------------- | ----------- | -------------- | ---------------------- | ------- | ------------- |
| 1   | 987654321 | 1       | これはテストツイートです。 | 123         | 45             | 2024-02-25 12:34:56+09 | false   | false         |

### **4.4 設計方針**

- **正規化**: ユーザー情報とツイート情報を分離し、データの整合性を保つ
- **パフォーマンス**: 頻繁に使用される検索・ソート条件にインデックスを設定
- **全文検索**: PostgreSQL の GIN インデックスを使用した日本語対応全文検索
- **制約**: 外部キー制約により関連データの整合性を保証
- **拡張性**: 将来的な機能追加に対応できるテーブル設計

## **5. API 設計（FastAPI）**

|          |                                                     |                        |
| -------- | --------------------------------------------------- | ---------------------- |
| メソッド | エンドポイント                                      | 説明                   |
| GET      | `/tweets`                                           | ツイート一覧取得       |
| GET      | `/tweets?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | 期間でフィルタリング   |
| GET      | `/tweets?search=keyword`                            | キーワード検索         |
| POST     | `/tweets/read/{tweet_id}`                           | 既読状態を更新         |
| POST     | `/tweets/bookmark/{tweet_id}`                       | ブックマーク追加・削除 |

## **6. フロントエンド設計（React）**

### **6.1 コンポーネント構成**

- `App.tsx`（メインコンポーネント）

- `TweetList.tsx`（ツイート一覧表示）

- `TweetItem.tsx`（ツイート 1 件の表示）

- `Filters.tsx`（検索・フィルタ UI）

- `SortButtons.tsx`（ソートボタン）

- `BookmarkList.tsx`（ブックマーク一覧）

### **6.2 フロントエンドの動作**

- `useEffect` で `/tweets` API からデータ取得

- **フィルタリング・ソート**

  - `useState` でフィルタ条件を管理し、動的にデータを更新

- **既読管理・ブックマーク**

  - `localStorage` に既読・ブックマーク状態を保存し、永続化
