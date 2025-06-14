/**
 * API通信設定
 */

// 開発環境ではViteプロキシ経由でAPI通信
const API_BASE_URL = '/api/v1';

/**
 * API通信用のfetch関数
 * 共通のエラーハンドリングやヘッダー設定を行う
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * APIエンドポイント定義
 */
export const API_ENDPOINTS = {
  // 基本
  health: '/health',

  // ユーザー管理
  users: '/users',
  user: (id: number) => `/users/${id}`,

  // 認証
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',
} as const;

// ツイートデータの型定義
export interface Tweet {
  id: number;
  tweet_id: string;
  content: string;
  tweet_url: string | null;
  likes_count: number;
  retweets_count: number;
  posted_at: string;
  is_read: boolean;
  is_bookmarked: boolean;
  user: {
    id: number;
    username: string;
    display_name: string | null;
    profile_url: string | null;
    profile_image_url: string | null;
  };
}

// APIレスポンスの型定義
export interface TweetsResponse {
  tweets: Tweet[];
}

export interface BookmarkedTweetsResponse {
  bookmarked_tweets: Tweet[];
}

// ツイート一覧取得
export async function fetchTweets(params?: {
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  order?: string;
}): Promise<TweetsResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        searchParams.append(key, value);
      }
    }
  }

  const url = `${API_BASE_URL}/tweets${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch tweets: ${response.statusText}`);
  }

  return response.json();
}

// ブックマーク一覧取得
export async function fetchBookmarkedTweets(): Promise<BookmarkedTweetsResponse> {
  const response = await fetch(`${API_BASE_URL}/tweets/bookmarked`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch bookmarked tweets: ${response.statusText}`,
    );
  }

  return response.json();
}

// ツイートを既読にする
export async function markTweetAsRead(tweetId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tweets/read/${tweetId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to mark tweet as read: ${response.statusText}`);
  }
}

// ブックマークの切り替え
export async function toggleBookmark(tweetId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tweets/bookmark/${tweetId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle bookmark: ${response.statusText}`);
  }
}
