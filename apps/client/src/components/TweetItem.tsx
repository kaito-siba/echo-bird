import type { TweetResponse } from '../integrations/tanstack-query/queries/tweets';
import * as styles from './TweetItem.css';

interface TweetItemProps {
  tweet: TweetResponse;
}

export function TweetItem({ tweet }: TweetItemProps) {
  // Unix timestamp を日時文字列に変換
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes}分前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // 数値を省略表示に変換（例: 1500 -> 1.5K）
  const formatCount = (count: number | null): string => {
    if (!count || count === 0) return '';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  // プロフィール画像のURL生成
  const getProfileImageUrl = (url: string | null): string => {
    if (!url) return '';
    // Twitter の profile image URL の場合、より高解像度版を取得
    return url.replace('_normal', '_bigger');
  };

  return (
    <article className={styles.tweetItem}>
      {/* リツイートヘッダー */}
      {tweet.is_retweet && (
        <div className={styles.retweetHeader}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className={styles.retweetIcon}
          >
            <path
              fill="currentColor"
              d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.061 0s-.293.768 0 1.061l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767.001-1.06z"
            />
          </svg>
          <span className={styles.retweetText}>
            {tweet.target_account_display_name || tweet.target_account_username}{' '}
            がリツイート
          </span>
        </div>
      )}

      {/* プロフィール画像 */}
      <div>
        {tweet.target_account_profile_image_url ? (
          <img
            src={getProfileImageUrl(tweet.target_account_profile_image_url)}
            alt={`@${tweet.target_account_username} のプロフィール画像`}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {tweet.target_account_username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* ツイート内容 */}
      <div className={styles.content}>
        {/* ヘッダー */}
        <div className={styles.header}>
          <span className={styles.displayName}>
            {tweet.is_retweet
              ? '元のツイート'
              : tweet.target_account_display_name ||
                tweet.target_account_username}
          </span>
          {!tweet.is_retweet && (
            <>
              <span className={styles.username}>
                @{tweet.target_account_username}
              </span>
              <span className={styles.separator}>·</span>
            </>
          )}
          <span className={styles.timestamp}>
            {formatDate(tweet.posted_at)}
          </span>

          {/* バッジ */}
          {tweet.is_reply && <span className={styles.replyBadge}>返信</span>}
          {tweet.is_quote && <span className={styles.quoteBadge}>引用</span>}
        </div>

        {/* ツイート本文 */}
        <div className={styles.text}>{tweet.full_text || tweet.content}</div>

        {/* エンゲージメント統計 */}
        <div className={styles.engagementStats}>
          {tweet.replies_count > 0 && (
            <div className={styles.statItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={styles.replyIcon}
              >
                <path
                  fill="currentColor"
                  d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c-3.13-.118-5.434-2.678-5.434-5.982 0-3.328 2.707-6.014 6.014-6.014l4.096.01c3.19.003 5.8 2.593 5.8 5.85-.003 1.858-.905 3.681-2.704 4.98z"
                />
              </svg>
              <span className={styles.statNumber}>
                {formatCount(tweet.replies_count)}
              </span>
            </div>
          )}

          {tweet.retweets_count > 0 && (
            <div className={styles.statItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={styles.retweetIcon}
              >
                <path
                  fill="currentColor"
                  d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.061 0s-.293.768 0 1.061l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767.001-1.06z"
                />
                <path
                  fill="currentColor"
                  d="M10.22 3.28c.293.293.767.293 1.06 0l2.22-2.22v10.24c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-5.85c-1.24 0-2.25-1.01-2.25-2.25V1.04l2.22 2.22c.293.293.768.293 1.061 0s.293-.768 0-1.061L14.5.699c-.145-.147-.337-.22-.53-.22s-.383.072-.53.22L10.22 2.22c-.294.292-.294.767-.001 1.06z"
                />
              </svg>
              <span className={styles.statNumber}>
                {formatCount(tweet.retweets_count)}
              </span>
            </div>
          )}

          {tweet.likes_count > 0 && (
            <div className={styles.statItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={styles.likeIcon}
              >
                <path
                  fill="currentColor"
                  d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"
                />
              </svg>
              <span className={styles.statNumber}>
                {formatCount(tweet.likes_count)}
              </span>
            </div>
          )}

          {tweet.views_count && tweet.views_count > 0 && (
            <div className={styles.statItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={styles.shareIcon}
              >
                <path
                  fill="currentColor"
                  d="M8.75 21V3h2v18h-2zM18 9.25l1.4 1.4-6.4 6.4-6.4-6.4L8 9.25l4 4 4-4z"
                />
              </svg>
              <span className={styles.statNumber}>
                {formatCount(tweet.views_count)}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
