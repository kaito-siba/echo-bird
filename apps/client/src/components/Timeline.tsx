import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { timelineQueryOptions } from '../integrations/tanstack-query/queries/tweets';
import * as styles from './Timeline.css';
import { TweetItem } from './TweetItem';

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
        <div className={styles.titleContainer}>
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
              <div className={styles.refreshIconSpinning} />
              更新中...
            </>
          ) : (
            <>
              <svg
                className={styles.refreshIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
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
          <div className={styles.loadingText}>ツイートを読み込み中...</div>
        </div>
      ) : isError ? (
        <div className={styles.errorContainer}>
          <svg
            className={styles.errorIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <div className={styles.errorMessage}>エラーが発生しました</div>
          <div className={styles.errorDescription}>
            {error instanceof Error
              ? error.message
              : 'ツイートの読み込みに失敗しました。しばらく時間をおいて再試行してください。'}
          </div>
          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                前のページ
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
                次のページ
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
