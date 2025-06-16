import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  timelineListQueryOptions,
  timelineTweetsQueryOptions,
} from '../integrations/tanstack-query/queries/timeline';
import {
  type TweetResponse,
  timelineQueryOptions,
} from '../integrations/tanstack-query/queries/tweets';
import * as styles from './Timeline.css';
import { TweetItem } from './TweetItem';

interface TimelineProps {
  targetAccountId?: number;
  selectedTimelineId?: number;
}

export function Timeline({
  targetAccountId,
  selectedTimelineId,
}: TimelineProps) {
  const [page, setPage] = useState(1);
  const [currentTimelineId, setCurrentTimelineId] = useState<number | null>(
    null,
  );
  const pageSize = 20;
  const navigate = useNavigate();

  // タイムライン一覧を取得
  const { data: timelinesData, isLoading: timelinesLoading } = useQuery(
    timelineListQueryOptions,
  );

  // selectedTimelineId が明示的に指定されている場合のみ自動選択
  useEffect(() => {
    if (selectedTimelineId && timelinesData) {
      // URL パラメータで指定されたタイムラインが存在し、アクティブかチェック
      const specifiedTimeline = timelinesData.timelines.find(
        (t) => t.id === selectedTimelineId && t.is_active,
      );
      if (specifiedTimeline) {
        setCurrentTimelineId(selectedTimelineId);
        setPage(1); // ページをリセット
      } else {
        // 指定されたタイムラインが見つからない場合は全体タイムラインにフォールバック
        setCurrentTimelineId(null);
        setPage(1); // ページをリセット
      }
    } else if (!selectedTimelineId) {
      // URL パラメータがない場合は全体タイムラインを表示
      setCurrentTimelineId(null);
      setPage(1); // ページをリセット
    }
  }, [selectedTimelineId, timelinesData]);

  // ツイートデータ取得 - カスタムタイムラインか全体タイムラインかで切り替え
  const useCustomTimeline = currentTimelineId !== null;

  // カスタムタイムライン用のクエリ
  const customTimelineQuery = useQuery({
    ...(currentTimelineId !== null
      ? timelineTweetsQueryOptions(currentTimelineId, page, pageSize)
      : { queryKey: ['disabled'], queryFn: () => Promise.resolve(null) }),
    enabled: useCustomTimeline && currentTimelineId !== null,
  });

  // 全体タイムライン用のクエリ
  const globalTimelineQuery = useQuery({
    ...timelineQueryOptions({
      page,
      page_size: pageSize,
      target_account_id: targetAccountId,
    }),
    enabled: !useCustomTimeline,
  });

  // 使用するクエリを選択
  const activeQuery = useCustomTimeline
    ? customTimelineQuery
    : globalTimelineQuery;
  const {
    data: timelineData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = activeQuery;

  const handleRefresh = () => {
    refetch();
  };

  // タイムライン切り替えハンドラー
  const handleTimelineChange = (timelineId: number | null) => {
    setCurrentTimelineId(timelineId);
    setPage(1); // ページをリセット

    // URL パラメータを更新
    navigate({
      to: '/timeline',
      search: timelineId ? { timelineId } : {},
    });
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

      {/* タイムライン選択タブ */}
      {!timelinesLoading &&
        timelinesData &&
        timelinesData.timelines.length > 0 && (
          <div className={styles.timelineTabContainer}>
            {/* 全体タイムラインタブ */}
            <button
              type="button"
              className={
                currentTimelineId === null
                  ? styles.timelineTabActive
                  : styles.timelineTab
              }
              onClick={() => handleTimelineChange(null)}
            >
              全体タイムライン
            </button>

            {/* カスタムタイムラインタブ */}
            {timelinesData.timelines
              .filter((timeline) => timeline.is_active)
              .map((timeline) => (
                <button
                  key={timeline.id}
                  type="button"
                  className={
                    currentTimelineId === timeline.id
                      ? styles.timelineTabActive
                      : styles.timelineTab
                  }
                  onClick={() => handleTimelineChange(timeline.id)}
                >
                  {timeline.name}
                  {timeline.is_default && (
                    <span className={styles.timelineTabDefault}>
                      (デフォルト)
                    </span>
                  )}
                </button>
              ))}
          </div>
        )}

      {/* コンテンツ */}
      {isLoading || timelinesLoading ? (
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
            {timelineData.tweets.map((tweet: TweetResponse) => (
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
