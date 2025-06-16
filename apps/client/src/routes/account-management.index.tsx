import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import {
  type TargetAccount,
  targetAccountListQueryOptions,
} from '../integrations/tanstack-query/queries/target-account';
import {
  type TwitterAccount,
  twitterAccountListQueryOptions,
} from '../integrations/tanstack-query/queries/twitter-account';
import {
  type User,
  userListQueryOptions,
} from '../integrations/tanstack-query/queries/user';
import {
  actionButton,
  cell,
  container,
  createButton,
  header,
  headerControls,
  row,
  searchInput,
  statusBadge,
  table,
} from '../styles/admin.css';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/account-management/')({
  component: AccountManagement,
  beforeLoad: authGuard,
  loader: ({ context }) => {
    // 3種類のアカウント情報を並行して取得
    return Promise.all([
      context.queryClient.ensureQueryData(targetAccountListQueryOptions),
      context.queryClient.ensureQueryData(twitterAccountListQueryOptions),
      context.queryClient.ensureQueryData(userListQueryOptions),
    ]);
  },
});

type AccountType = 'target' | 'twitter' | 'echobird';

function AccountManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AccountType>('target');

  // 各アカウント情報を取得
  const { data: targetAccountData } = useSuspenseQuery(
    targetAccountListQueryOptions,
  );
  const { data: twitterAccountData } = useSuspenseQuery(
    twitterAccountListQueryOptions,
  );
  const { data: echoBirdAccountData } = useSuspenseQuery(userListQueryOptions);

  // 検索とフィルタリング
  const filteredAccounts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    switch (activeTab) {
      case 'target':
        return targetAccountData.accounts.filter(
          (account) =>
            account.username.toLowerCase().includes(searchLower) ||
            account.display_name?.toLowerCase().includes(searchLower),
        );
      case 'twitter':
        return twitterAccountData.accounts.filter(
          (account) =>
            account.username.toLowerCase().includes(searchLower) ||
            account.display_name.toLowerCase().includes(searchLower),
        );
      case 'echobird':
        return echoBirdAccountData.filter((account) =>
          account.username.toLowerCase().includes(searchLower),
        );
      default:
        return [];
    }
  }, [
    activeTab,
    searchTerm,
    targetAccountData,
    twitterAccountData,
    echoBirdAccountData,
  ]);

  // 日時フォーマット関数
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  // 取得間隔フォーマット関数（ターゲットアカウント用）
  const formatInterval = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    if (minutes % 60 === 0) {
      return `${minutes / 60}時間`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  return (
    <div className={container}>
      <div className={header}>
        <h1>アカウント管理</h1>
        <div className={headerControls}>
          <input
            type="text"
            placeholder="アカウント名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={searchInput}
          />
          {activeTab === 'target' && (
            <button
              className={createButton}
              onClick={() => navigate({ to: '/target-accounts/create' })}
            >
              ターゲットアカウント追加
            </button>
          )}
        </div>
      </div>

      {/* タブ切り替え */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('target')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'target' ? '#1976d2' : '#f5f5f5',
            color: activeTab === 'target' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ターゲットアカウント ({targetAccountData.total})
        </button>
        <button
          onClick={() => setActiveTab('twitter')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'twitter' ? '#1976d2' : '#f5f5f5',
            color: activeTab === 'twitter' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Twitter アカウント ({twitterAccountData.total})
        </button>
        <button
          onClick={() => setActiveTab('echobird')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'echobird' ? '#1976d2' : '#f5f5f5',
            color: activeTab === 'echobird' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          EchoBird ユーザー ({echoBirdAccountData.length})
        </button>
      </div>

      {/* ターゲットアカウント一覧テーブル */}
      {activeTab === 'target' && (
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
            {(filteredAccounts as TargetAccount[]).map((account) => (
              <tr key={account.id} className={row}>
                <td className={cell}>{account.id}</td>
                <td className={cell}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
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
      )}

      {/* Twitter アカウント一覧テーブル */}
      {activeTab === 'twitter' && (
        <table className={table}>
          <thead>
            <tr>
              <th className={cell}>ID</th>
              <th className={cell}>ユーザー名</th>
              <th className={cell}>表示名</th>
              <th className={cell}>ステータス</th>
              <th className={cell}>フォロワー数</th>
              <th className={cell}>フォロー数</th>
              <th className={cell}>最終ログイン</th>
              <th className={cell}>作成日</th>
              <th className={cell}>アクション</th>
            </tr>
          </thead>
          <tbody>
            {(filteredAccounts as TwitterAccount[]).map((account) => (
              <tr key={account.id} className={row}>
                <td className={cell}>{account.id}</td>
                <td className={cell}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
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
                  </div>
                </td>
                <td className={cell}>{account.display_name}</td>
                <td className={cell}>
                  <span
                    className={
                      statusBadge[account.is_active ? 'active' : 'inactive']
                    }
                  >
                    {account.status}
                  </span>
                </td>
                <td className={cell}>
                  {account.followers_count.toLocaleString()}
                </td>
                <td className={cell}>
                  {account.following_count.toLocaleString()}
                </td>
                <td className={cell}>{formatDate(account.last_login_at)}</td>
                <td className={cell}>{formatDate(account.created_at)}</td>
                <td className={cell}>
                  <button
                    className={actionButton}
                    onClick={() => {
                      // Twitter アカウント詳細・編集画面への遷移
                      console.log('Twitter account edit:', account.id);
                    }}
                  >
                    編集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* EchoBird ユーザー一覧テーブル */}
      {activeTab === 'echobird' && (
        <table className={table}>
          <thead>
            <tr>
              <th className={cell}>ID</th>
              <th className={cell}>ユーザー名</th>
              <th className={cell}>ステータス</th>
              <th className={cell}>管理者権限</th>
              <th className={cell}>作成日</th>
              <th className={cell}>更新日</th>
              <th className={cell}>アクション</th>
            </tr>
          </thead>
          <tbody>
            {(filteredAccounts as User[]).map((account) => (
              <tr key={account.id} className={row}>
                <td className={cell}>{account.id}</td>
                <td className={cell}>{account.username}</td>
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
                  <span
                    style={{ color: account.is_admin ? '#1976d2' : '#666' }}
                  >
                    {account.is_admin ? '管理者' : '一般ユーザー'}
                  </span>
                </td>
                <td className={cell}>{formatDate(account.created_at)}</td>
                <td className={cell}>{formatDate(account.updated_at)}</td>
                <td className={cell}>
                  <button
                    className={actionButton}
                    onClick={() => {
                      // EchoBird ユーザー詳細・編集画面への遷移
                      console.log('EchoBird user edit:', account.id);
                    }}
                  >
                    編集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 空データ時のメッセージ */}
      {filteredAccounts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm
            ? '検索条件に一致するアカウントが見つかりません。'
            : `${
                activeTab === 'target'
                  ? 'ターゲットアカウント'
                  : activeTab === 'twitter'
                    ? 'Twitter アカウント'
                    : 'EchoBird ユーザー'
              }がまだ登録されていません。`}
        </div>
      )}
    </div>
  );
}
