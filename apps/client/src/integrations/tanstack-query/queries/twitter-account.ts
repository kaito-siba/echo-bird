import { queryOptions } from '@tanstack/react-query';
import { apiClientJson } from '../../../utils/api-client';

// サーバー側の TwitterAccountResponse インターフェースと同じ構造
interface TwitterAccountResponse {
  id: number;
  twitter_id: string;
  username: string;
  display_name: string;
  profile_image_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  is_active: boolean;
  status: string;
  created_at: number;
  updated_at: number;
  last_login_at: number | null;
}

interface TwitterAccountListResponse {
  accounts: TwitterAccountResponse[];
  total: number;
}

// API クライアント関数
async function fetchTwitterAccounts(): Promise<TwitterAccountListResponse> {
  return apiClientJson<TwitterAccountListResponse>('/twitter/accounts', {
    method: 'GET',
  });
}

// TanStack Query options
export const twitterAccountListQueryOptions = queryOptions({
  queryKey: ['twitter-accounts'],
  queryFn: fetchTwitterAccounts,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: 2,
});

export type { TwitterAccountResponse, TwitterAccountListResponse };
