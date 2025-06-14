import { createFileRoute, Link } from '@tanstack/react-router';
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  container,
  header,
  tableContainer,
  table,
  tableHeader,
  tableRow,
  tableCell,
  buttonGroup,
  createButton,
  editButton,
  deleteButton,
} from '../styles/admin.css';
import { authGuard } from '../utils/auth-guard';
import {
  twitterAccountListQueryOptions,
  type TwitterAccountResponse,
} from '../integrations/tanstack-query/queries/twitter-account';

export const Route = createFileRoute('/twitter-accounts/')({
  component: TwitterAccountsList,
  beforeLoad: authGuard,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(twitterAccountListQueryOptions);
  },
});

function TwitterAccountsList() {
  const queryClient = useQueryClient();

  // Twitter アカウント一覧を取得
  const { data: twitterAccountsData } = useSuspenseQuery(
    twitterAccountListQueryOptions,
  );

  // アカウント削除のミューテーション（将来的に実装）
  const deleteAccountMutation = useMutation({
    mutationFn: async (_accountId: number) => {
      // TODO: 削除 API の実装
      throw new Error('削除機能は未実装です');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-accounts'] });
    },
  });

  const handleDelete = (account: TwitterAccountResponse) => {
    if (window.confirm(`@${account.username} のアカウントを削除しますか？`)) {
      deleteAccountMutation.mutate(account.id);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '未設定';
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const getStatusBadge = (isActive: boolean, status: string) => {
    if (!isActive) {
      return (
        <span
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
          }}
        >
          非アクティブ
        </span>
      );
    }

    if (status === 'Active') {
      return (
        <span
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            backgroundColor: '#d1fae5',
            color: '#059669',
          }}
        >
          アクティブ
        </span>
      );
    }

    return (
      <span
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          backgroundColor: '#fef3c7',
          color: '#d97706',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className={container}>
      <div className={header}>
        <h1>認証済み Twitter アカウント管理</h1>
        <p>ツイート取得に使用する Twitter アカウントを管理します</p>
        <div className={buttonGroup}>
          <Link to="/twitter-accounts/create">
            <button className={createButton}>新しいアカウントを認証</button>
          </Link>
        </div>
      </div>

      <div className={tableContainer}>
        {twitterAccountsData.accounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>認証済み Twitter アカウントがありません。</p>
            <p>新しいアカウントを認証してください。</p>
          </div>
        ) : (
          <table className={table}>
            <thead>
              <tr className={tableHeader}>
                <th className={tableCell}>プロフィール</th>
                <th className={tableCell}>ユーザー名</th>
                <th className={tableCell}>表示名</th>
                <th className={tableCell}>ステータス</th>
                <th className={tableCell}>フォロワー数</th>
                <th className={tableCell}>フォロー数</th>
                <th className={tableCell}>最終ログイン</th>
                <th className={tableCell}>作成日時</th>
                <th className={tableCell}>操作</th>
              </tr>
            </thead>
            <tbody>
              {twitterAccountsData.accounts.map((account) => (
                <tr key={account.id} className={tableRow}>
                  <td className={tableCell}>
                    {account.profile_image_url ? (
                      <img
                        src={account.profile_image_url}
                        alt={`@${account.username}`}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          color: '#6b7280',
                        }}
                      >
                        👤
                      </div>
                    )}
                  </td>
                  <td className={tableCell}>
                    <strong>@{account.username}</strong>
                  </td>
                  <td className={tableCell}>{account.display_name}</td>
                  <td className={tableCell}>
                    {getStatusBadge(account.is_active, account.status)}
                  </td>
                  <td className={tableCell}>
                    {formatNumber(account.followers_count)}
                  </td>
                  <td className={tableCell}>
                    {formatNumber(account.following_count)}
                  </td>
                  <td className={tableCell}>
                    {formatDate(account.last_login_at)}
                  </td>
                  <td className={tableCell}>
                    {formatDate(account.created_at)}
                  </td>
                  <td className={tableCell}>
                    <div className={buttonGroup}>
                      <Link to={`/twitter-accounts/${account.id}`}>
                        <button className={editButton}>詳細</button>
                      </Link>
                      <button
                        className={deleteButton}
                        onClick={() => handleDelete(account)}
                        disabled={deleteAccountMutation.isPending}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        合計: {twitterAccountsData.total} アカウント
      </div>
    </div>
  );
}
