import { queryOptions } from '@tanstack/react-query';
import { apiClientJson } from '../../../utils/api-client';

// メディア型定義
export interface MediaResponse {
  media_key: string;
  media_type: 'photo' | 'video' | 'animated_gif';
  media_url: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  duration_ms: number | null;
}

// API レスポンス型定義
export interface TweetResponse {
  id: number;
  tweet_id: string;
  content: string;
  full_text: string | null;
  lang: string | null;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  quotes_count: number;
  views_count: number | null;
  bookmark_count: number | null;
  is_retweet: boolean;
  is_quote: boolean;
  is_quoted: boolean;
  retweeted_tweet_id: string | null;
  quoted_tweet_id: string | null;
  is_reply: boolean;
  in_reply_to_tweet_id: string | null;
  in_reply_to_user_id: string | null;
  conversation_id: string | null;
  hashtags: any[] | null;
  urls: any[] | null;
  user_mentions: any[] | null;
  is_possibly_sensitive: boolean;
  has_media: boolean;
  media: MediaResponse[];
  posted_at: number;
  created_at: number;
  updated_at: number;
  // ターゲットアカウント情報
  target_account_id: number;
  target_account_username: string;
  target_account_display_name: string | null;
  target_account_profile_image_url: string | null;
  // リツイート・引用ツイート情報
  original_author_username: string | null;
  original_author_display_name: string | null;
  original_author_profile_image_url: string | null;
  // 引用元ツイート情報
  quoted_tweet: TweetResponse | null;
  // ユーザー固有の情報
  is_read: boolean;
  is_bookmarked: boolean;
}

interface TimelineResponse {
  tweets: TweetResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

interface TimelineParams {
  page?: number;
  page_size?: number;
  target_account_id?: number;
}

interface BookmarkedTweetsResponse {
  tweets: TweetResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

interface BookmarkedTweetsParams {
  page?: number;
  page_size?: number;
  target_account_id?: number;
}

// タイムライン取得API
const fetchTimeline = async (
  params?: TimelineParams,
): Promise<TimelineResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }

  if (params?.page_size) {
    searchParams.append('page_size', params.page_size.toString());
  }

  if (params?.target_account_id) {
    searchParams.append(
      'target_account_id',
      params.target_account_id.toString(),
    );
  }

  const url = `/tweets/timeline${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return apiClientJson<TimelineResponse>(url, {
    method: 'GET',
  });
};

// ツイート詳細取得API
const fetchTweetDetail = async (tweetId: string): Promise<TweetResponse> => {
  return apiClientJson<TweetResponse>(`/tweets/${tweetId}`, {
    method: 'GET',
  });
};

// ブックマーク一覧取得API
const fetchBookmarkedTweets = async (
  params?: BookmarkedTweetsParams,
): Promise<BookmarkedTweetsResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }

  if (params?.page_size) {
    searchParams.append('page_size', params.page_size.toString());
  }

  if (params?.target_account_id) {
    searchParams.append(
      'target_account_id',
      params.target_account_id.toString(),
    );
  }

  const url = `/tweets/bookmarked${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return apiClientJson<BookmarkedTweetsResponse>(url, {
    method: 'GET',
  });
};

// ブックマーク切り替えAPI
const toggleBookmark = async (
  tweetId: number,
): Promise<{ message: string; is_bookmarked: boolean }> => {
  return apiClientJson<{ message: string; is_bookmarked: boolean }>(
    `/tweets/bookmark/${tweetId}`,
    {
      method: 'POST',
    },
  );
};

// TanStack Query options
export const timelineQueryOptions = (params?: TimelineParams) =>
  queryOptions({
    queryKey: ['tweets', 'timeline', params],
    queryFn: () => fetchTimeline(params),
    staleTime: 30 * 1000, // 30秒間キャッシュ
    retry: 3,
  });

export const tweetDetailQueryOptions = (tweetId: string) =>
  queryOptions({
    queryKey: ['tweets', 'detail', tweetId],
    queryFn: () => fetchTweetDetail(tweetId),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 3,
  });

export const bookmarkedTweetsQueryOptions = (params?: BookmarkedTweetsParams) =>
  queryOptions({
    queryKey: ['tweets', 'bookmarked', params],
    queryFn: () => fetchBookmarkedTweets(params),
    staleTime: 30 * 1000, // 30秒間キャッシュ
    retry: 3,
  });

export type {
  TimelineResponse,
  TimelineParams,
  BookmarkedTweetsResponse,
  BookmarkedTweetsParams,
};

// ブックマーク切り替え関数をエクスポート
export { toggleBookmark };
