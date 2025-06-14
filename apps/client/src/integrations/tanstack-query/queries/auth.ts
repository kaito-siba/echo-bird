import { queryOptions } from '@tanstack/react-query';
import { apiClientJson, apiClientPublicJson } from '../../../utils/api-client';

// API レスポンス型定義
interface LoginRequest {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface UserMeResponse {
  id: number;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: number;
  updated_at: number;
}

// 認証トークンの管理
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
  // トークン変更を通知
  window.dispatchEvent(new Event('tokenChange'));
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  // トークン変更を通知
  window.dispatchEvent(new Event('tokenChange'));
};

// ログインAPI
export const login = async (
  credentials: LoginRequest,
): Promise<TokenResponse> => {
  return apiClientPublicJson<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// 現在のユーザー情報取得API
const fetchCurrentUser = async (): Promise<UserMeResponse> => {
  const token = getAuthToken();

  if (!token) {
    // トークンがない場合はエラーを投げるだけ（リダイレクトはauthGuardで処理）
    throw new Error('認証トークンが見つかりません');
  }

  return apiClientJson<UserMeResponse>('/auth/me', {
    method: 'GET',
  });
};

// TanStack Query options
export const currentUserQueryOptions = queryOptions({
  queryKey: ['auth', 'current-user'],
  queryFn: fetchCurrentUser,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: false, // 認証エラーの場合はリトライしない
});

export type { LoginRequest, TokenResponse, UserMeResponse };
