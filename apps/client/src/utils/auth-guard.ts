import { redirect } from '@tanstack/react-router';
import { getAuthToken } from '../integrations/tanstack-query/queries/auth';

/**
 * 認証が必要なルートでトークンの存在をチェックし、
 * トークンがない場合はログインページにリダイレクトする
 *
 * @param currentPath - 現在のパス（ログイン後のリダイレクト先として保存）
 * @throws {redirect} - トークンがない場合、ログインページにリダイレクト
 */
export const requireAuth = (currentPath: string) => {
  // 既にログインページにいる場合は処理しない（無限ループ防止）
  if (currentPath.startsWith('/login')) {
    return;
  }

  const token = getAuthToken();

  if (!token) {
    // 現在のパスを保存（ログイン後にリダイレクトするため）
    sessionStorage.setItem('redirectAfterLogin', currentPath);

    // ログインページにリダイレクト
    throw redirect({
      to: '/login',
      statusCode: 401,
    });
  }
};

/**
 * 認証状態をチェックして、認証済みかどうかを返す
 *
 * @returns {boolean} - 認証済みの場合true、未認証の場合false
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * 認証が必要なルートの beforeLoad で使用するヘルパー関数
 *
 * @param ctx - TanStack Router の beforeLoad コンテキスト
 */
export const authGuard = ({ location }: any) => {
  const currentPath = location.pathname + (location.search || '');
  requireAuth(currentPath);
};
