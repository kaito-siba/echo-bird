import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timelineQueryOptions } from '../integrations/tanstack-query/queries/tweets';
import { TweetItem } from './TweetItem';
import * as styles from './Timeline.css';

interface TimelineProps {
  targetAccountId?: number;
}

export function Timeline({ targetAccountId }: TimelineProps) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const {
    data: timelineData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery(
    timelineQueryOptions({
      page,
      page_size: pageSize,
      target_account_id: targetAccountId,
    }),
  );

  const handleRefresh = () => {
    refetch();
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (timelineData?.has_next) {
      setPage(page + 1);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className={styles.timeline}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>タイムライン</h1>
          <div className={styles.subtitle}>
            {timelineData?.total ? `${timelineData.total} 件のツイート` : ''}
          </div>
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={isFetching}
        >
          {isFetching ? (
            <>
              <div className={styles.loadingSpinner} />
              <span style={{ marginLeft: '8px' }}>更新中...</span>
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                style={{ marginRight: '6px' }}
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.57.46-3.03 1.24-4.26L6.7 6.3c-.78 1.33-1.2 2.86-1.2 4.7 0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8c-1.84 0-3.37.42-4.7 1.2L7.74 5.76C8.97 4.46 10.43 4 12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"
                />
              </svg>
              更新
            </>
          )}
        </button>
      </div>

      {/* コンテンツ */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
        </div>
      ) : isError ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : 'ツイートの読み込みに失敗しました'}
          </div>
          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
          >
            再試行
          </button>
        </div>
      ) : !timelineData?.tweets || timelineData.tweets.length === 0 ? (
        <div className={styles.emptyContainer}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
          <div className={styles.emptyTitle}>ツイートがありません</div>
          <div className={styles.emptyDescription}>
            ターゲットアカウントを追加してツイートを取得してください。
          </div>
        </div>
      ) : (
        <>
          {/* ツイートリスト */}
          <div className={styles.tweetList}>
            {timelineData.tweets.map((tweet) => (
              <TweetItem key={tweet.id} tweet={tweet} />
            ))}
          </div>

          {/* ページネーション */}
          {timelineData.total > pageSize && (
            <div className={styles.paginationContainer}>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                ← 前のページ
              </button>

              <div className={styles.paginationInfo}>
                {page} / {Math.ceil(timelineData.total / pageSize)} ページ
              </div>

              <button
                type="button"
                className={styles.paginationButton}
                onClick={handleNextPage}
                disabled={!timelineData.has_next}
              >
                次のページ →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
