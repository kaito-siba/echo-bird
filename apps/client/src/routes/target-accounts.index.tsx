import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  container,
  header,
  headerControls,
  table,
  row,
  cell,
  searchInput,
  actionButton,
  createButton,
  statusBadge,
} from '../styles/admin.css';
import { targetAccountListQueryOptions } from '../integrations/tanstack-query/queries/target-account';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/target-accounts/')({
  component: TargetAccounts,
  beforeLoad: authGuard,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(targetAccountListQueryOptions);
  },
});

function TargetAccounts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // APIからターゲットアカウント一覧を取得
  const { data } = useSuspenseQuery(targetAccountListQueryOptions);

  // Filter accounts based on search term
  const filteredAccounts = useMemo(() => {
    return data.accounts.filter(
      (account) =>
        account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (account.display_name &&
          account.display_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())),
    );
  }, [data.accounts, searchTerm]);

  // Format Unix timestamp to readable date
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  // Format fetch interval
  const formatInterval = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    } else if (minutes % 60 === 0) {
      return `${minutes / 60}時間`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}時間${mins}分`;
    }
  };

  return (
    <div className={container}>
      <div className={header}>
        <h1>ターゲットアカウント管理</h1>
        <div className={headerControls}>
          <input
            type="text"
            placeholder="ユーザー名または表示名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={searchInput}
          />
          <button
            className={createButton}
            onClick={() => navigate({ to: '/target-accounts/create' })}
          >
            新しいターゲットアカウントを追加
          </button>
        </div>
      </div>

      <table className={table}>
        <thead>
          <tr>
            <th className={cell}>ID</th>
            <th className={cell}>ユーザー名</th>
            <th className={cell}>表示名</th>
            <th className={cell}>ステータス</th>
            <th className={cell}>フォロワー数</th>
            <th className={cell}>取得間隔</th>
            <th className={cell}>最終取得</th>
            <th className={cell}>エラー</th>
            <th className={cell}>アクション</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.map((account) => (
            <tr key={account.id} className={row}>
              <td className={cell}>{account.id}</td>
              <td className={cell}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {account.profile_image_url && (
                    <img
                      src={account.profile_image_url}
                      alt={account.username}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                  @{account.username}
                  {account.is_verified && ' ✓'}
                  {account.is_blue_verified && ' 🔵'}
                  {account.is_protected && ' 🔒'}
                </div>
              </td>
              <td className={cell}>{account.display_name || '-'}</td>
              <td className={cell}>
                <span
                  className={
                    statusBadge[account.is_active ? 'active' : 'inactive']
                  }
                >
                  {account.is_active ? 'アクティブ' : '非アクティブ'}
                </span>
              </td>
              <td className={cell}>
                {account.followers_count.toLocaleString()}
              </td>
              <td className={cell}>
                {formatInterval(account.fetch_interval_minutes)}
              </td>
              <td className={cell}>{formatDate(account.last_fetched_at)}</td>
              <td className={cell}>
                {account.consecutive_errors > 0 && (
                  <span style={{ color: '#d32f2f' }}>
                    {account.consecutive_errors}回
                  </span>
                )}
              </td>
              <td className={cell}>
                <button
                  className={actionButton}
                  onClick={() => {
                    navigate({
                      to: '/target-accounts/$accountId',
                      params: { accountId: account.id.toString() },
                    });
                  }}
                >
                  編集
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredAccounts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm
            ? '検索条件に一致するターゲットアカウントが見つかりません。'
            : 'ターゲットアカウントがまだ登録されていません。'}
        </div>
      )}
    </div>
  );
}
