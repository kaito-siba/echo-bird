import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClientError } from '../../lib/api-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 認証エラーの場合は再試行しない
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError && error.status === 401) {
          return false
        }
        return failureCount < 3
      },
    },
    mutations: {
      // 認証エラーの場合は再試行しない
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError && error.status === 401) {
          return false
        }
        return failureCount < 3
      },
    },
  },
});

export function getContext() {
  return {
    queryClient,
  };
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
