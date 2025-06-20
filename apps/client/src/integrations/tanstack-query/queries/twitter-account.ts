import { queryOptions } from '@tanstack/react-query';
import { apiClientJson } from '../../../utils/api-client';

// サーバー側のTwitterAccountResponseインターフェースと同じ構造
interface TwitterAccount {
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
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
  last_login_at: number | null; // Unix timestamp
}

interface TwitterAccountListResponse {
  accounts: TwitterAccount[];
  total: number;
}

interface TwitterAuthRequest {
  username: string;
  email: string;
  password: string;
}

interface TwitterAuthResponse {
  success: boolean;
  message: string;
  account: TwitterAccount | null;
}

// APIクライアント関数
async function fetchTwitterAccounts(): Promise<TwitterAccountListResponse> {
  return apiClientJson<TwitterAccountListResponse>('/twitter/accounts', {
    method: 'GET',
  });
}

async function fetchTwitterAccount(accountId: string): Promise<TwitterAccount> {
  return apiClientJson<TwitterAccount>(`/twitter/accounts/${accountId}`, {
    method: 'GET',
  });
}

async function authenticateTwitterAccount(
  data: TwitterAuthRequest,
): Promise<TwitterAuthResponse> {
  return apiClientJson<TwitterAuthResponse>('/twitter/authenticate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function refreshTwitterAccount(
  accountId: string,
): Promise<TwitterAccount> {
  return apiClientJson<TwitterAccount>(
    `/twitter/accounts/${accountId}/refresh`,
    {
      method: 'PUT',
    },
  );
}

async function deleteTwitterAccount(
  accountId: string,
): Promise<{ message: string }> {
  return apiClientJson<{ message: string }>(`/twitter/accounts/${accountId}`, {
    method: 'DELETE',
  });
}

// TanStack Query options
export const twitterAccountListQueryOptions = queryOptions({
  queryKey: ['twitter-accounts'],
  queryFn: fetchTwitterAccounts,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: 2,
});

export const twitterAccountDetailQueryOptions = (accountId: string) =>
  queryOptions({
    queryKey: ['twitter-accounts', accountId],
    queryFn: () => fetchTwitterAccount(accountId),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 2,
  });

export type {
  TwitterAccount,
  TwitterAccountListResponse,
  TwitterAuthRequest,
  TwitterAuthResponse,
};

export {
  authenticateTwitterAccount,
  refreshTwitterAccount,
  deleteTwitterAccount,
};
