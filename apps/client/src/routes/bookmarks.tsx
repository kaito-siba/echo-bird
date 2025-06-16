import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { TweetItem } from '../components/TweetItem';
import { targetAccountListQueryOptions } from '../integrations/tanstack-query/queries/target-account';
import { timelineListQueryOptions } from '../integrations/tanstack-query/queries/timeline';
import { bookmarkedTweetsQueryOptions } from '../integrations/tanstack-query/queries/tweets';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/bookmarks')({
  component: BookmarksPage,
  beforeLoad: authGuard,
});

function BookmarksPage() {
  const [page, setPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState<
    number | undefined
  >(undefined);
  const [selectedTimelineId, setSelectedTimelineId] = useState<
    number | undefined
  >(undefined);
  const [filterType, setFilterType] = useState<'account' | 'timeline' | 'all'>(
    'all',
  );
  const pageSize = 20;

  // ターゲットアカウント一覧を取得
  const { data: accountsData } = useQuery(targetAccountListQueryOptions);

  // タイムライン一覧を取得
  const { data: timelinesData } = useQuery(timelineListQueryOptions);

  // ブックマーク一覧を取得
  const {
    data: bookmarksData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    bookmarkedTweetsQueryOptions({
      page,
      page_size: pageSize,
      target_account_id:
        filterType === 'account' ? selectedAccountId : undefined,
      timeline_id: filterType === 'timeline' ? selectedTimelineId : undefined,
    }),
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          fontSize: '16px',
          color: '#666',
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}
        >
          ブックマーク
        </h1>
        <div
          style={{
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '16px',
          }}
        >
          エラーが発生しました: {error.message}
        </div>
        <button
          onClick={() => refetch()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          再読み込み
        </button>
      </div>
    );
  }

  const tweets = bookmarksData?.tweets || [];
  const total = bookmarksData?.total || 0;
  const hasNext = bookmarksData?.has_next || false;

  return (
    <div>
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          position: 'sticky',
          top: '0',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0',
            color: '#111827',
          }}
        >
          ブックマーク
        </h1>
        {total > 0 && (
          <p
            style={{
              color: '#6b7280',
              margin: '4px 0 0 0',
              fontSize: '14px',
            }}
          >
            {total} 件のツイート
          </p>
        )}
        {/* フィルター */}
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {/* フィルター種類選択 */}
          <select
            value={filterType}
            onChange={(e) => {
              const newFilterType = e.target.value as
                | 'account'
                | 'timeline'
                | 'all';
              setFilterType(newFilterType);
              setSelectedAccountId(undefined);
              setSelectedTimelineId(undefined);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            <option value="all">すべて</option>
            <option value="account">アカウント別</option>
            <option value="timeline">タイムライン別</option>
          </select>

          {/* アカウント選択 */}
          {filterType === 'account' &&
            accountsData &&
            accountsData.accounts.length > 0 && (
              <select
                value={selectedAccountId || ''}
                onChange={(e) => {
                  setSelectedAccountId(
                    e.target.value ? Number(e.target.value) : undefined,
                  );
                  setPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: '#374151',
                  cursor: 'pointer',
                  minWidth: '200px',
                }}
              >
                <option value="">アカウントを選択</option>
                {accountsData.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    @{account.username}{' '}
                    {account.display_name && `(${account.display_name})`}
                  </option>
                ))}
              </select>
            )}

          {/* タイムライン選択 */}
          {filterType === 'timeline' &&
            timelinesData &&
            timelinesData.timelines.length > 0 && (
              <select
                value={selectedTimelineId || ''}
                onChange={(e) => {
                  setSelectedTimelineId(
                    e.target.value ? Number(e.target.value) : undefined,
                  );
                  setPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: '#374151',
                  cursor: 'pointer',
                  minWidth: '200px',
                }}
              >
                <option value="">タイムラインを選択</option>
                {timelinesData.timelines
                  .filter((timeline) => timeline.is_active)
                  .map((timeline) => (
                    <option key={timeline.id} value={timeline.id}>
                      {timeline.name} ({timeline.target_accounts.length}
                      アカウント)
                    </option>
                  ))}
              </select>
            )}
        </div>
      </div>

      {tweets.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            📖
          </div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 8px 0',
              color: '#374151',
            }}
          >
            ブックマークがありません
          </h2>
          <p
            style={{
              margin: '0',
              fontSize: '16px',
            }}
          >
            気に入ったツイートをブックマークすると、ここに表示されます。
          </p>
        </div>
      ) : (
        <>
          {/* ツイート一覧 */}
          <div>
            {tweets.map((tweet) => (
              <TweetItem key={tweet.id} tweet={tweet} />
            ))}
          </div>

          {/* ページネーション */}
          {(page > 1 || hasNext) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#fff',
              }}
            >
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  前のページ
                </button>
              )}

              <span
                style={{
                  padding: '8px 12px',
                  color: '#6b7280',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ページ {page}
              </span>

              {hasNext && (
                <button
                  onClick={() => setPage(page + 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  次のページ
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
