import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  currentUserQueryOptions,
  removeAuthToken,
} from '../integrations/tanstack-query/queries/auth';
import { useAuthToken } from '../hooks/useAuthToken';
import {
  sidebar,
  sidebarHeader,
  sidebarNav,
  sidebarNavItem,
  sidebarNavItemActive,
  sidebarFooter,
  logoutButton,
  userInfo,
} from '../styles/sidebar.css.ts';

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // トークンの状態をリアクティブに管理
  const hasToken = useAuthToken();

  // トークンがある場合のみユーザー情報を取得
  const { data: currentUser, isLoading } = useQuery({
    ...currentUserQueryOptions,
    enabled: hasToken, // トークンがある場合のみクエリを実行
  });

  // ログアウトのミューテーション
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // トークンを削除
      removeAuthToken();
      return true;
    },
    onSuccess: () => {
      // 認証関連のクエリをすべて無効化してキャッシュをクリア
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.removeQueries({ queryKey: ['auth'] });

      // ログイン画面にリダイレクト
      navigate({ to: '/login' });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  // ログアウト処理
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // ユーザーがログインしていない場合は何も表示しない
  if (!currentUser && !isLoading) {
    return null;
  }

  return (
    <aside className={sidebar}>
      {/* サイドバーヘッダー */}
      <div className={sidebarHeader}>
        <h2>Echo Bird</h2>
        {currentUser && (
          <div className={userInfo}>
            <span>ようこそ、{currentUser.username}さん</span>
          </div>
        )}
      </div>

      {/* ナビゲーション */}
      <nav className={sidebarNav}>
        <Link to="/" className={sidebarNavItem}>
          <span>🏠</span>
          <span>ホーム</span>
        </Link>

        {currentUser?.is_admin && (
          <>
            <Link to="/admin/users" className={sidebarNavItem}>
              <span>👥</span>
              <span>ユーザー管理</span>
            </Link>
            <Link to="/target-accounts" className={sidebarNavItem}>
              <span>🎯</span>
              <span>ターゲットアカウント</span>
            </Link>
          </>
        )}

        <Link to="/demo/tanstack-query" className={sidebarNavItem}>
          <span>🔄</span>
          <span>TanStack Query</span>
        </Link>

        <Link to="/demo/store" className={sidebarNavItem}>
          <span>🗃️</span>
          <span>Store</span>
        </Link>

        <Link to="/test/api" className={sidebarNavItem}>
          <span>🧪</span>
          <span>API テスト</span>
        </Link>
      </nav>

      {/* サイドバーフッター（ログアウトボタン）*/}
      <div className={sidebarFooter}>
        <button
          type="button"
          className={logoutButton}
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <>
              <span>⏳</span>
              <span>ログアウト中...</span>
            </>
          ) : (
            <>
              <span>🚪</span>
              <span>ログアウト</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
