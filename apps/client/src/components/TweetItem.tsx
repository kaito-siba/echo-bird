import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { TweetResponse } from '../integrations/tanstack-query/queries/tweets';
import { toggleBookmark } from '../integrations/tanstack-query/queries/tweets';
import * as styles from './TweetItem.css';

interface TweetItemProps {
  tweet: TweetResponse;
}

export function TweetItem({ tweet }: TweetItemProps) {
  const queryClient = useQueryClient();
  const [hoveredMediaKey, setHoveredMediaKey] = useState<string | null>(null);

  // ブックマーク切り替えMutation
  const bookmarkMutation = useMutation({
    mutationFn: (tweetId: number) => toggleBookmark(tweetId),
    onSuccess: () => {
      // タイムラインとブックマーク一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['tweets', 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['tweets', 'bookmarked'] });
    },
  });

  // ブックマークボタンクリックハンドラー
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを停止
    bookmarkMutation.mutate(tweet.id);
  };

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
    }
    if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    }
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
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

  // メディアグリッドのクラス名を取得する関数
  const getMediaGridClass = (mediaCount: number, media?: any[]): string => {
    switch (mediaCount) {
      case 1:
        return styles.mediaGridSingle;
      case 2:
        // 2枚の場合、横長画像が多い場合は縦並びレイアウトを使用
        if (media && isWideMediaLayout(media)) {
          return styles.mediaGridDoubleVertical;
        }
        return styles.mediaGridDouble;
      case 3:
        return styles.mediaGridTriple;
      case 4:
      default:
        return styles.mediaGridQuad;
    }
  };

  // メディアが横長レイアウトに適しているかを判定
  const isWideMediaLayout = (media: any[]): boolean => {
    // 2枚の場合、両方とも横長（width > height）であれば縦並びレイアウトを使用
    if (media.length === 2) {
      return media.every((m) => {
        // widthとheightが利用可能な場合のみ判定
        if (m.width && m.height) {
          return m.width > m.height * 1.5; // 横長の判定（1.5倍以上）
        }
        return false;
      });
    }
    return false;
  };

  // メディアアイテムのクラス名を取得する関数
  const getMediaItemClass = (
    mediaCount: number,
    index: number,
    media?: any[],
  ): string => {
    // 単一メディアの場合、適切なアスペクト比を保つ
    if (mediaCount === 1) {
      return styles.mediaItemSingle;
    }
    // 2枚の横長画像の場合、横長スタイルを適用
    if (mediaCount === 2 && media && isWideMediaLayout(media)) {
      return styles.mediaItemWide;
    }
    // 3つのメディアの場合、最初のものを大きく表示
    if (mediaCount === 3 && index === 0) {
      return styles.mediaItemLarge;
    }
    if (mediaCount === 3 && index > 0) {
      return styles.mediaItemSmall;
    }
    return styles.mediaItem;
  };

  // 引用ツイート用のメディアアイテムクラス取得関数
  const getQuotedTweetMediaItemClass = (
    mediaCount: number,
    index: number,
    media?: any[],
  ): string => {
    // 単一メディアの場合
    if (mediaCount === 1) {
      return styles.quotedTweetMediaItemSingle;
    }
    // 2枚の横長画像の場合
    if (mediaCount === 2 && media && isWideMediaLayout(media)) {
      return styles.quotedTweetMediaItemWide;
    }
    // 3つのメディアの場合、最初のものを大きく表示
    if (mediaCount === 3 && index === 0) {
      return styles.mediaItemLarge;
    }
    if (mediaCount === 3 && index > 0) {
      return styles.mediaItemSmall;
    }
    return styles.mediaItem;
  };

  // メディアクリック時の処理
  const handleMediaClick = (mediaUrl: string): void => {
    // 新しいタブでメディアを開く
    window.open(mediaUrl, '_blank', 'noopener,noreferrer');
  };

  // ツイート本文内のURLを検出してリンクに変換する関数
  const parseTextWithUrls = (text: string): React.ReactNode => {
    // URLを検出するための正規表現（Twitter標準のURL検出パターン）
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // テキストをURLで分割
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      // URLパターンにマッチするかチェック
      if (urlRegex.test(part)) {
        // URLの場合はクリック可能なリンクとして表示
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.urlLink}
            onClick={(e) => e.stopPropagation()} // 親要素のクリックイベントを停止
          >
            {part}
          </a>
        );
      }
      // 通常のテキストの場合はそのまま表示
      return part;
    });
  };

  return (
    <article className={`${styles.tweetItem} ${styles.responsiveContainer}`}>
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

      {/* メインコンテンツ */}
      <div className={styles.mainContent}>
        {/* プロフィール画像 */}
        <div>
          {/* リツイートの場合は元作者のプロフィール画像、通常は投稿者のプロフィール画像 */}
          {tweet.is_retweet && tweet.original_author_profile_image_url ? (
            <img
              src={getProfileImageUrl(tweet.original_author_profile_image_url)}
              alt={`@${tweet.original_author_username} のプロフィール画像`}
              className={`${styles.avatar} ${styles.responsiveAvatar}`}
            />
          ) : tweet.target_account_profile_image_url ? (
            <img
              src={getProfileImageUrl(tweet.target_account_profile_image_url)}
              alt={`@${tweet.target_account_username} のプロフィール画像`}
              className={`${styles.avatar} ${styles.responsiveAvatar}`}
            />
          ) : (
            <div
              className={`${styles.avatarFallback} ${styles.responsiveAvatar}`}
            >
              {tweet.is_retweet && tweet.original_author_username
                ? tweet.original_author_username.charAt(0).toUpperCase()
                : tweet.target_account_username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* ツイート内容 */}
        <div className={styles.content}>
          {/* ヘッダー */}
          <div className={styles.header}>
            <span className={styles.displayName}>
              {tweet.is_retweet && tweet.original_author_display_name
                ? tweet.original_author_display_name
                : tweet.is_retweet && tweet.original_author_username
                  ? tweet.original_author_username
                  : tweet.is_retweet
                    ? '元ツイート作者'
                    : tweet.target_account_display_name ||
                      tweet.target_account_username}
            </span>
            <span className={styles.username}>
              @
              {tweet.is_retweet && tweet.original_author_username
                ? tweet.original_author_username
                : tweet.is_retweet
                  ? 'original_author'
                  : tweet.target_account_username}
            </span>
            <span className={styles.separator}>·</span>
            <span className={styles.timestamp}>
              {formatDate(tweet.posted_at)}
            </span>

            {/* バッジ */}
            {tweet.is_reply && <span className={styles.replyBadge}>返信</span>}
            {tweet.is_quote && <span className={styles.quoteBadge}>引用</span>}
          </div>

          {/* ツイート本文 */}
          <div className={`${styles.text} ${styles.responsiveText}`}>
            {parseTextWithUrls(tweet.full_text || tweet.content)}
          </div>

          {/* 引用ツイート表示 */}
          {tweet.is_quote && tweet.quoted_tweet && (
            <div className={styles.quotedTweetContainer}>
              <div className={styles.quotedTweetHeader}>
                {/* 引用元作者のプロフィール画像 */}
                {tweet.quoted_tweet.target_account_profile_image_url ? (
                  <img
                    src={getProfileImageUrl(
                      tweet.quoted_tweet.target_account_profile_image_url,
                    )}
                    alt={`@${tweet.quoted_tweet.target_account_username} のプロフィール画像`}
                    className={styles.quotedTweetAvatar}
                  />
                ) : (
                  <div className={styles.quotedTweetAvatarFallback}>
                    {tweet.quoted_tweet.target_account_username
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* 引用元作者情報 */}
                <div className={styles.quotedTweetAuthor}>
                  <span className={styles.quotedTweetDisplayName}>
                    {tweet.quoted_tweet.target_account_display_name ||
                      tweet.quoted_tweet.target_account_username}
                  </span>
                  <span className={styles.quotedTweetUsername}>
                    @{tweet.quoted_tweet.target_account_username}
                  </span>
                  <span className={styles.separator}>·</span>
                  <span className={styles.quotedTweetTimestamp}>
                    {formatDate(tweet.quoted_tweet.posted_at)}
                  </span>
                </div>
              </div>

              {/* 引用元ツイート本文 */}
              <div className={styles.quotedTweetText}>
                {parseTextWithUrls(tweet.quoted_tweet.full_text || tweet.quoted_tweet.content)}
              </div>

              {/* 引用元ツイートのメディア */}
              {tweet.quoted_tweet.media &&
                tweet.quoted_tweet.media.length > 0 && (
                  <div
                    className={
                      tweet.quoted_tweet.media.length === 1
                        ? styles.quotedTweetMediaContainerSingle
                        : styles.quotedTweetMediaContainer
                    }
                  >
                    <div
                      className={getMediaGridClass(
                        tweet.quoted_tweet.media.length,
                        tweet.quoted_tweet?.media,
                      )}
                    >
                      {tweet.quoted_tweet.media.map((media, index) => (
                        <div
                          key={media.media_key}
                          className={getQuotedTweetMediaItemClass(
                            tweet.quoted_tweet?.media?.length || 0,
                            index,
                            tweet.quoted_tweet?.media,
                          )}
                          onClick={() => handleMediaClick(media.media_url)}
                          onMouseEnter={() =>
                            setHoveredMediaKey(media.media_key)
                          }
                          onMouseLeave={() => setHoveredMediaKey(null)}
                        >
                          {media.media_type === 'photo' ? (
                            <img
                              src={media.media_url}
                              alt={media.alt_text || '引用ツイート画像'}
                              className={
                                (tweet.quoted_tweet?.media?.length || 0) === 1
                                  ? styles.quotedTweetMediaImage
                                  : styles.quotedTweetMediaImageMultiple
                              }
                              loading="lazy"
                            />
                          ) : media.media_type === 'video' ? (
                            <>
                              <video
                                src={media.media_url}
                                className={
                                  (tweet.quoted_tweet?.media?.length || 0) === 1
                                    ? styles.quotedTweetMediaVideo
                                    : styles.quotedTweetMediaVideoMultiple
                                }
                                controls={false}
                                muted
                                playsInline
                                onMouseEnter={(e) => e.currentTarget.play()}
                                onMouseLeave={(e) => e.currentTarget.pause()}
                              />
                              <div
                                className={
                                  hoveredMediaKey === media.media_key
                                    ? styles.mediaOverlayHidden
                                    : styles.mediaOverlay
                                }
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className={styles.playIcon}
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                動画
                              </div>
                            </>
                          ) : (
                            <div className={styles.placeholderMedia}>
                              メディアを読み込めません
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* 引用リツイートをリツイートした場合の引用元ツイート表示 */}
          {tweet.is_retweet && !tweet.is_quote && tweet.quoted_tweet && (
            <div className={styles.quotedTweetContainer}>
              <div className={styles.quotedTweetHeader}>
                {/* 引用元作者のプロフィール画像 */}
                {tweet.quoted_tweet.target_account_profile_image_url ? (
                  <img
                    src={getProfileImageUrl(
                      tweet.quoted_tweet.target_account_profile_image_url,
                    )}
                    alt={`@${tweet.quoted_tweet.target_account_username} のプロフィール画像`}
                    className={styles.quotedTweetAvatar}
                  />
                ) : (
                  <div className={styles.quotedTweetAvatarFallback}>
                    {tweet.quoted_tweet.target_account_username
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* 引用元作者情報 */}
                <div className={styles.quotedTweetAuthor}>
                  <span className={styles.quotedTweetDisplayName}>
                    {tweet.quoted_tweet.target_account_display_name ||
                      tweet.quoted_tweet.target_account_username}
                  </span>
                  <span className={styles.quotedTweetUsername}>
                    @{tweet.quoted_tweet.target_account_username}
                  </span>
                  <span className={styles.separator}>·</span>
                  <span className={styles.quotedTweetTimestamp}>
                    {formatDate(tweet.quoted_tweet.posted_at)}
                  </span>
                </div>
              </div>

              {/* 引用元ツイート本文 */}
              <div className={styles.quotedTweetText}>
                {parseTextWithUrls(tweet.quoted_tweet.full_text || tweet.quoted_tweet.content)}
              </div>

              {/* 引用元ツイートのメディア */}
              {tweet.quoted_tweet.media &&
                tweet.quoted_tweet.media.length > 0 && (
                  <div
                    className={
                      tweet.quoted_tweet.media.length === 1
                        ? styles.quotedTweetMediaContainerSingle
                        : styles.quotedTweetMediaContainer
                    }
                  >
                    <div
                      className={getMediaGridClass(
                        tweet.quoted_tweet.media.length,
                        tweet.quoted_tweet?.media,
                      )}
                    >
                      {tweet.quoted_tweet.media.map((media, index) => (
                        <div
                          key={media.media_key}
                          className={getQuotedTweetMediaItemClass(
                            tweet.quoted_tweet?.media?.length || 0,
                            index,
                            tweet.quoted_tweet?.media,
                          )}
                          onClick={() => handleMediaClick(media.media_url)}
                          onMouseEnter={() =>
                            setHoveredMediaKey(media.media_key)
                          }
                          onMouseLeave={() => setHoveredMediaKey(null)}
                        >
                          {media.media_type === 'photo' ? (
                            <img
                              src={media.media_url}
                              alt={media.alt_text || '引用ツイート画像'}
                              className={
                                (tweet.quoted_tweet?.media?.length || 0) === 1
                                  ? styles.quotedTweetMediaImage
                                  : styles.quotedTweetMediaImageMultiple
                              }
                              loading="lazy"
                            />
                          ) : media.media_type === 'video' ? (
                            <>
                              <video
                                src={media.media_url}
                                className={
                                  (tweet.quoted_tweet?.media?.length || 0) === 1
                                    ? styles.quotedTweetMediaVideo
                                    : styles.quotedTweetMediaVideoMultiple
                                }
                                controls={false}
                                muted
                                playsInline
                                onMouseEnter={(e) => e.currentTarget.play()}
                                onMouseLeave={(e) => e.currentTarget.pause()}
                              />
                              <div
                                className={
                                  hoveredMediaKey === media.media_key
                                    ? styles.mediaOverlayHidden
                                    : styles.mediaOverlay
                                }
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className={styles.playIcon}
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                動画
                              </div>
                            </>
                          ) : (
                            <div className={styles.placeholderMedia}>
                              メディアを読み込めません
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* メディア表示 */}
          {tweet.media && tweet.media.length > 0 && (
            <div
              className={`${
                tweet.media.length === 1
                  ? styles.mediaContainerSingle
                  : styles.mediaContainer
              } ${styles.responsiveMediaContainer}`}
            >
              <div
                className={getMediaGridClass(tweet.media.length, tweet.media)}
              >
                {tweet.media.map((media, index) => (
                  <div
                    key={media.media_key}
                    className={getMediaItemClass(
                      tweet.media.length,
                      index,
                      tweet.media,
                    )}
                    onClick={() => handleMediaClick(media.media_url)}
                    onMouseEnter={() => setHoveredMediaKey(media.media_key)}
                    onMouseLeave={() => setHoveredMediaKey(null)}
                  >
                    {media.media_type === 'photo' ? (
                      <>
                        <img
                          src={media.media_url}
                          alt={media.alt_text || 'ツイート画像'}
                          className={
                            tweet.media.length === 1
                              ? styles.mediaImage
                              : styles.mediaImageMultiple
                          }
                          loading="lazy"
                        />
                      </>
                    ) : media.media_type === 'video' ? (
                      <>
                        <video
                          src={media.media_url}
                          className={
                            tweet.media.length === 1
                              ? styles.mediaVideo
                              : styles.mediaVideoMultiple
                          }
                          controls={false}
                          muted
                          preload="metadata"
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                        <div
                          className={
                            hoveredMediaKey === media.media_key
                              ? styles.mediaOverlayHidden
                              : styles.mediaOverlay
                          }
                        >
                          <svg viewBox="0 0 24 24" className={styles.playIcon}>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          動画
                        </div>
                      </>
                    ) : media.media_type === 'animated_gif' ? (
                      <>
                        <video
                          src={media.media_url}
                          className={
                            tweet.media.length === 1
                              ? styles.mediaVideo
                              : styles.mediaVideoMultiple
                          }
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                        <div
                          className={
                            hoveredMediaKey === media.media_key
                              ? styles.mediaOverlayHidden
                              : styles.mediaOverlay
                          }
                        >
                          <span className={styles.gifIcon}>GIF</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

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

            {/* ブックマークボタン */}
            <button
              onClick={handleBookmarkClick}
              className={styles.statItem}
              aria-label={
                tweet.is_bookmarked
                  ? 'ブックマークを削除'
                  : 'ブックマークに追加'
              }
              disabled={bookmarkMutation.isPending}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={
                  tweet.is_bookmarked
                    ? styles.bookmarkIconActive
                    : styles.bookmarkIcon
                }
              >
                <path
                  fill={tweet.is_bookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                />
              </svg>
            </button>

            {/* 外部リンクボタン */}
            <a
              href={`https://x.com/${tweet.is_retweet && tweet.original_author_username ? tweet.original_author_username : tweet.target_account_username}/status/${tweet.tweet_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLinkButton}
              onClick={(e) => e.stopPropagation()}
              aria-label="X で開く"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={styles.externalLinkIcon}
              >
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
