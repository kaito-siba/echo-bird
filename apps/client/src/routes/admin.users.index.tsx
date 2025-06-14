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
  errorContainer,
  statusBadge,
} from '../styles/admin.css';
import {
  userListQueryOptions,
  type User,
} from '../integrations/tanstack-query/queries/user';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/admin/users/')({
  component: AdminUsers,
  beforeLoad: authGuard,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(userListQueryOptions);
  },
});

function AdminUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // APIからユーザー一覧を取得
  const { data: users, error } = useSuspenseQuery(userListQueryOptions);

  // エラーハンドリング
  if (error) {
    return (
      <div className={container}>
        <div className={header}>
          <h1>ユーザー管理</h1>
        </div>
        <div className={errorContainer}>
          エラーが発生しました: {error.message}
        </div>
      </div>
    );
  }

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  // Format Unix timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  return (
    <div className={container}>
      <div className={header}>
        <h1>ユーザー管理</h1>
        <div className={headerControls}>
          <input
            type="text"
            placeholder="ユーザー名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={searchInput}
          />
          <button
            className={createButton}
            onClick={() => navigate({ to: '/admin/users/create' })}
          >
            新しいユーザーを作成
          </button>
        </div>
      </div>

      <table className={table}>
        <thead>
          <tr>
            <th className={cell}>ID</th>
            <th className={cell}>ユーザー名</th>
            <th className={cell}>ステータス</th>
            <th className={cell}>権限</th>
            <th className={cell}>作成日時</th>
            <th className={cell}>更新日時</th>
            <th className={cell}>アクション</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className={row}>
              <td className={cell}>{user.id}</td>
              <td className={cell}>{user.username}</td>
              <td className={cell}>
                <span
                  className={
                    statusBadge[user.is_active ? 'active' : 'inactive']
                  }
                >
                  {user.is_active ? 'アクティブ' : '非アクティブ'}
                </span>
              </td>
              <td className={cell}>
                <span className={statusBadge[user.is_admin ? 'admin' : 'user']}>
                  {user.is_admin ? '管理者' : 'ユーザー'}
                </span>
              </td>
              <td className={cell}>{formatDate(user.created_at)}</td>
              <td className={cell}>{formatDate(user.updated_at)}</td>
              <td className={cell}>
                <button
                  className={actionButton}
                  onClick={() => {
                    console.log('編集ボタンがクリックされました:', user.id);
                    navigate({
                      to: '/admin/users/$userId',
                      params: { userId: user.id.toString() },
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
    </div>
  );
}
