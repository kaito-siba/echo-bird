import { queryOptions } from '@tanstack/react-query';
import { apiClientJson } from '../../../utils/api-client';

// サーバー側のTargetAccountResponseインターフェースと同じ構造
interface TargetAccount {
  id: number;
  twitter_user_id: string;
  username: string;
  display_name: string | null;
  description: string | null;
  location: string | null;
  url: string | null;
  profile_image_url: string | null;
  profile_banner_url: string | null;
  is_active: boolean;
  is_protected: boolean;
  is_verified: boolean;
  is_blue_verified: boolean;
  followers_count: number;
  following_count: number;
  tweets_count: number;
  listed_count: number;
  favorites_count: number;
  last_fetched_at: number | null;
  last_tweet_id: string | null;
  fetch_interval_minutes: number;
  max_tweets_per_fetch: number;
  consecutive_errors: number;
  last_error: string | null;
  last_error_at: number | null;
  account_created_at: number | null;
  created_at: number;
  updated_at: number;
}

interface TargetAccountListResponse {
  accounts: TargetAccount[];
  total: number;
}

interface TargetAccountCreateRequest {
  username: string;
  twitter_account_id: number;
  fetch_interval_minutes: number;
  max_tweets_per_fetch: number;
}

interface TargetAccountUpdateRequest {
  is_active?: boolean;
  fetch_interval_minutes?: number;
  max_tweets_per_fetch?: number;
}

// APIクライアント関数
async function fetchTargetAccounts(): Promise<TargetAccountListResponse> {
  return apiClientJson<TargetAccountListResponse>('/target-accounts', {
    method: 'GET',
  });
}

async function fetchTargetAccount(accountId: string): Promise<TargetAccount> {
  return apiClientJson<TargetAccount>(`/target-accounts/${accountId}`, {
    method: 'GET',
  });
}

async function createTargetAccount(data: TargetAccountCreateRequest): Promise<{
  success: boolean;
  message: string;
  account: TargetAccount | null;
}> {
  return apiClientJson('/target-accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function updateTargetAccount(
  accountId: string,
  data: TargetAccountUpdateRequest,
): Promise<TargetAccount> {
  return apiClientJson<TargetAccount>(`/target-accounts/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function deleteTargetAccount(accountId: string): Promise<{ success: boolean; message: string }> {
  return apiClientJson(`/target-accounts/${accountId}`, {
    method: 'DELETE',
  });
}

async function fetchTweetsForAccount(accountId: string): Promise<{
  success: boolean;
  message: string;
  fetched_count: number;
}> {
  return apiClientJson(`/target-accounts/${accountId}/fetch-tweets`, {
    method: 'POST',
  });
}

// TanStack Query options
export const targetAccountListQueryOptions = queryOptions({
  queryKey: ['target-accounts'],
  queryFn: fetchTargetAccounts,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: 2,
});

export const targetAccountDetailQueryOptions = (accountId: string) =>
  queryOptions({
    queryKey: ['target-accounts', accountId],
    queryFn: () => fetchTargetAccount(accountId),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 2,
  });

export type { TargetAccount, TargetAccountListResponse, TargetAccountCreateRequest, TargetAccountUpdateRequest };
export { createTargetAccount, updateTargetAccount, deleteTargetAccount, fetchTweetsForAccount };