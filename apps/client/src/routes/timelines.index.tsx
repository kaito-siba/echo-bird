import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import {
  timelineListQueryOptions,
  useDeleteTimelineMutation,
} from '../integrations/tanstack-query/queries/timeline';
import {
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

export const Route = createFileRoute('/timelines/')({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(timelineListQueryOptions);
  },
  component: Timelines,
});

function Timelines() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // APIからタイムライン一覧を取得
  const { data } = useSuspenseQuery(timelineListQueryOptions);
  const deleteTimelineMutation = useDeleteTimelineMutation();

  // 検索フィルタリング
  const filteredTimelines = useMemo(() => {
    return data.timelines.filter(
      (timeline) =>
        timeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timeline.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data.timelines, searchTerm]);

  // 日時フォーマット
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  // タイムライン削除
  const handleDelete = async (timelineId: number, timelineName: string) => {
    if (
      window.confirm(
        `「${timelineName}」を削除しますか？この操作は取り消せません。`,
      )
    ) {
      try {
        await deleteTimelineMutation.mutateAsync(timelineId);
        alert('タイムラインを削除しました');
      } catch (error) {
        console.error('Failed to delete timeline:', error);
        alert('タイムラインの削除に失敗しました');
      }
    }
  };

  return (
    <div className={container}>
      <div className={header}>
        <h1>タイムライン管理</h1>
        <div className={headerControls}>
          <input
            type="text"
            placeholder="タイムライン名または説明で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={searchInput}
          />
          <button
            className={createButton}
            onClick={() => navigate({ to: '/timelines/create' })}
          >
            新しいタイムラインを作成
          </button>
        </div>
      </div>

      <table className={table}>
        <thead>
          <tr>
            <th className={cell}>ID</th>
            <th className={cell}>タイムライン名</th>
            <th className={cell}>説明</th>
            <th className={cell}>ステータス</th>
            <th className={cell}>ターゲットアカウント</th>
            <th className={cell}>作成日時</th>
            <th className={cell}>アクション</th>
          </tr>
        </thead>
        <tbody>
          {filteredTimelines.map((timeline) => (
            <tr key={timeline.id} className={row}>
              <td className={cell}>{timeline.id}</td>
              <td className={cell}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {timeline.name}
                  {timeline.is_default && (
                    <span
                      style={{
                        fontSize: '12px',
                        background: '#2196F3',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      デフォルト
                    </span>
                  )}
                </div>
              </td>
              <td className={cell}>{timeline.description || '-'}</td>
              <td className={cell}>
                <span
                  className={
                    statusBadge[timeline.is_active ? 'active' : 'inactive']
                  }
                >
                  {timeline.is_active ? 'アクティブ' : '非アクティブ'}
                </span>
              </td>
              <td className={cell}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {timeline.target_accounts.map((account) => (
                    <span
                      key={account.id}
                      style={{
                        fontSize: '12px',
                        background: account.is_active ? '#4CAF50' : '#757575',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {account.profile_image_url && (
                        <img
                          src={account.profile_image_url}
                          alt={account.username}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                      @{account.username}
                    </span>
                  ))}
                </div>
              </td>
              <td className={cell}>{formatDate(timeline.created_at)}</td>
              <td className={cell}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() =>
                      navigate({ to: `/timelines/${timeline.id}` })
                    }
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #2196F3',
                      background: '#2196F3',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    表示
                  </button>
                  <button
                    onClick={() =>
                      navigate({ to: `/timelines/${timeline.id}/edit` })
                    }
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #4CAF50',
                      background: '#4CAF50',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(timeline.id, timeline.name)}
                    disabled={deleteTimelineMutation.isPending}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #f44336',
                      background: '#f44336',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      opacity: deleteTimelineMutation.isPending ? 0.5 : 1,
                    }}
                  >
                    {deleteTimelineMutation.isPending ? '削除中...' : '削除'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredTimelines.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm
            ? '検索条件に一致するタイムラインが見つかりません。'
            : 'タイムラインがまだ作成されていません。'}
        </div>
      )}
    </div>
  );
}
