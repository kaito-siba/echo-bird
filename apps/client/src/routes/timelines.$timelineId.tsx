import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  timelineDetailQueryOptions,
  timelineTweetsQueryOptions,
  useDeleteTimelineMutation,
} from '../integrations/tanstack-query/queries/timeline';
import { container, header, headerControls } from '../styles/admin.css';
import { TweetItem } from '../components/TweetItem';

export const Route = createFileRoute('/timelines/$timelineId')({
  loader: ({ context, params }) => {
    const timelineId = Number.parseInt(params.timelineId);
    return Promise.all([
      context.queryClient.ensureQueryData(
        timelineDetailQueryOptions(timelineId),
      ),
      context.queryClient.ensureQueryData(
        timelineTweetsQueryOptions(timelineId, 1, 20),
      ),
    ]);
  },
  component: TimelineDetail,
});

function TimelineDetail() {
  const navigate = useNavigate();
  const { timelineId } = Route.useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // データ取得
  const { data: timeline } = useSuspenseQuery(
    timelineDetailQueryOptions(Number.parseInt(timelineId)),
  );
  const { data: tweetsData } = useSuspenseQuery(
    timelineTweetsQueryOptions(
      Number.parseInt(timelineId),
      currentPage,
      pageSize,
    ),
  );

  const deleteTimelineMutation = useDeleteTimelineMutation();

  // 日時フォーマット（タイムライン情報表示用）
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };



  // タイムライン削除
  const handleDelete = async () => {
    if (
      window.confirm(
        `「${timeline.name}」を削除しますか？この操作は取り消せません。`,
      )
    ) {
      try {
        await deleteTimelineMutation.mutateAsync(timeline.id);
        alert('タイムラインを削除しました');
        navigate({ to: '/timelines' });
      } catch (error) {
        console.error('Failed to delete timeline:', error);
        alert('タイムラインの削除に失敗しました');
      }
    }
  };

  // ページネーション
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(tweetsData.total / pageSize);

  return (
    <div className={container}>

      {/* ヘッダー */}
      <div className={header}>
        <div>
          <h1>{timeline.name}</h1>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            {timeline.description || 'タイムラインの説明はありません'}
          </p>
        </div>
        <div className={headerControls}>
          <button
            onClick={() => navigate({ to: `/timelines/${timeline.id}/edit` })}
            style={{
              padding: '8px 16px',
              border: '1px solid #4CAF50',
              background: '#4CAF50',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px',
            }}
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTimelineMutation.isPending}
            style={{
              padding: '8px 16px',
              border: '1px solid #f44336',
              background: '#f44336',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: deleteTimelineMutation.isPending ? 0.5 : 1,
            }}
          >
            {deleteTimelineMutation.isPending ? '削除中...' : '削除'}
          </button>
        </div>
      </div>

      {/* タイムライン情報 */}
      <div
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>基本情報</h3>
            <p>
              <strong>ID:</strong> {timeline.id}
            </p>
            <p>
              <strong>ステータス:</strong>
              <span
                style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: timeline.is_active ? '#4CAF50' : '#f44336',
                  color: 'white',
                }}
              >
                {timeline.is_active ? 'アクティブ' : '非アクティブ'}
              </span>
            </p>
            <p>
              <strong>デフォルト:</strong>{' '}
              {timeline.is_default ? 'はい' : 'いいえ'}
            </p>
            <p>
              <strong>作成日時:</strong> {formatDate(timeline.created_at)}
            </p>
            <p>
              <strong>更新日時:</strong> {formatDate(timeline.updated_at)}
            </p>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
              ターゲットアカウント ({timeline.target_accounts.length}個)
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {timeline.target_accounts.map((account) => (
                <div
                  key={account.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: account.is_active ? '#e3f2fd' : '#f5f5f5',
                    border: `1px solid ${account.is_active ? '#2196F3' : '#ccc'}`,
                    borderRadius: '16px',
                    fontSize: '14px',
                  }}
                >
                  {account.profile_image_url && (
                    <img
                      src={account.profile_image_url}
                      alt={account.username}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                  @{account.username}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ツイート一覧 */}
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>ツイート一覧</h2>
          <span style={{ color: '#666' }}>{tweetsData.total}件のツイート</span>
        </div>

        {tweetsData.tweets.length > 0 ? (
          <>
            {/* ツイートリスト */}
            <div>
              {tweetsData.tweets.map((tweet: any) => (
                <TweetItem key={tweet.id} tweet={tweet} />
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: '1rem',
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    background: currentPage === 1 ? '#f5f5f5' : 'white',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  前のページ
                </button>

                <span style={{ padding: '8px 12px', alignSelf: 'center' }}>
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    background:
                      currentPage === totalPages ? '#f5f5f5' : 'white',
                    borderRadius: '4px',
                    cursor:
                      currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  次のページ
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#666',
            }}
          >
            このタイムラインにはまだツイートがありません。
            <br />
            ターゲットアカウントからツイートが取得されると表示されます。
          </div>
        )}
      </div>
    </div>
  );
}
