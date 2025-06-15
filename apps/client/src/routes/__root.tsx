import {
  Outlet,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import AuthLayout from '../components/AuthLayout';
import Layout from '../components/Layout';

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx';

import type { QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
  queryClient: QueryClient;
}

// ErrorBoundary コンポーネント
function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Layout>
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          margin: '2rem',
        }}
      >
        <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>
          エラーが発生しました
        </h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {error.message || '予期しないエラーが発生しました'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          リトライ
        </button>
      </div>
    </Layout>
  );
}

// レイアウトコンポーネント
function RootComponent() {
  const location = useLocation();

  // ログインページの場合は認証レイアウトを使用
  if (location.pathname === '/login') {
    return (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    );
  }

  // その他のページは通常のレイアウト（サイドバー付き）を使用
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <RootComponent />
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </>
  ),
  errorComponent: ErrorBoundary,
});
