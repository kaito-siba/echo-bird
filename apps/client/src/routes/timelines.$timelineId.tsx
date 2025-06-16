import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  timelineDetailQueryOptions,
  timelineTweetsQueryOptions,
  useDeleteTimelineMutation
} from '../integrations/tanstack-query/queries/timeline';
import { container, header, headerControls } from '../styles/admin.css';

export const Route = createFileRoute('/timelines/$timelineId')({
  loader: ({ context, params }) => {
    const timelineId = parseInt(params.timelineId);
    return Promise.all([
      context.queryClient.ensureQueryData(timelineDetailQueryOptions(timelineId)),
      context.queryClient.ensureQueryData(timelineTweetsQueryOptions(timelineId, 1, 20)),
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
    timelineDetailQueryOptions(parseInt(timelineId))
  );
  const { data: tweetsData } = useSuspenseQuery(
    timelineTweetsQueryOptions(parseInt(timelineId), currentPage, pageSize)
  );

  const deleteTimelineMutation = useDeleteTimelineMutation();

  // 日時フォーマット
  const formatDate = (timestamp: number) => {
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

  // プロフィール画像のURL生成
  const getProfileImageUrl = (url: string | null): string => {
    if (!url) return '';
    // Twitter の profile image URL の場合、より高解像度版を取得
    return url.replace('_normal', '_bigger');
  };

  // メディアクリック処理
  const handleMediaClick = (mediaUrl: string) => {
    window.open(mediaUrl, '_blank', 'noopener,noreferrer');
  };

  // メディアグリッドのクラス名を取得
  const getMediaGridClass = (mediaCount: number): string => {
    const baseStyle = {
      display: 'grid',
      gap: '2px',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '100%',
    };

    switch (mediaCount) {
      case 1:
        return 'single-media';
      case 2:
        return 'double-media';
      case 3:
        return 'triple-media';
      case 4:
      default:
        return 'quad-media';
    }
  };

  // タイムライン削除
  const handleDelete = async () => {
    if (window.confirm(`「${timeline.name}」を削除しますか？この操作は取り消せません。`)) {
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
      {/* メディア用のスタイル定義 */}
      <style>{`
        .single-media {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2px;
          border-radius: 12px;
          overflow: hidden;
          max-height: 400px;
        }
        .double-media {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          border-radius: 12px;
          overflow: hidden;
          max-height: 300px;
        }
        .triple-media {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 2px;
          border-radius: 12px;
          overflow: hidden;
          max-height: 300px;
        }
        .triple-media > :first-child {
          grid-row: span 2;
        }
        .quad-media {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 2px;
          border-radius: 12px;
          overflow: hidden;
          max-height: 300px;
        }
        .media-item {
          position: relative;
          background: #f5f5f5;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
        }
        .media-item:hover {
          opacity: 0.9;
        }
        .media-item img, .media-item video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .play-icon {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
        .retweet-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #536471;
          font-size: 13px;
        }
        .retweet-icon {
          color: #00ba7c;
        }
        .quoted-tweet {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 12px;
          margin-top: 12px;
          background: #f8f9fa;
        }
        .quoted-tweet-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .quoted-tweet-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }
        .quoted-tweet-author {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }
        .quoted-tweet-display-name {
          font-weight: bold;
        }
        .quoted-tweet-username {
          color: #536471;
        }
        .quoted-tweet-timestamp {
          color: #536471;
        }
        .separator {
          color: #536471;
        }
      `}</style>

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
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>基本情報</h3>
            <p><strong>ID:</strong> {timeline.id}</p>
            <p><strong>ステータス:</strong>
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                background: timeline.is_active ? '#4CAF50' : '#f44336',
                color: 'white',
              }}>
                {timeline.is_active ? 'アクティブ' : '非アクティブ'}
              </span>
            </p>
            <p><strong>デフォルト:</strong> {timeline.is_default ? 'はい' : 'いいえ'}</p>
            <p><strong>作成日時:</strong> {formatDate(timeline.created_at)}</p>
            <p><strong>更新日時:</strong> {formatDate(timeline.updated_at)}</p>
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
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0 }}>ツイート一覧</h2>
          <span style={{ color: '#666' }}>
            {tweetsData.total}件のツイート
          </span>
        </div>

        {tweetsData.tweets.length > 0 ? (
          <>
            {/* ツイートリスト */}
            <div style={{ padding: '1rem' }}>
              {tweetsData.tweets.map((tweet: any) => (
                <div
                  key={tweet.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  {/* リツイートヘッダー */}
                  {tweet.is_retweet && (
                    <div className="retweet-header">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        className="retweet-icon"
                      >
                        <path
                          fill="currentColor"
                          d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.061 0s-.293.768 0 1.061l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767.001-1.06z"
                        />
                      </svg>
                      <span>
                        {tweet.target_account_display_name || tweet.target_account_username} がリツイート
                      </span>
                    </div>
                  )}

                  {/* メインコンテンツ */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {/* プロフィール画像 */}
                    <div style={{ flexShrink: 0 }}>
                      {/* リツイートの場合は元作者のプロフィール画像、通常は投稿者のプロフィール画像 */}
                      {tweet.is_retweet && tweet.original_author_profile_image_url ? (
                        <img
                          src={getProfileImageUrl(tweet.original_author_profile_image_url)}
                          alt={`@${tweet.original_author_username} のプロフィール画像`}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                          }}
                        />
                      ) : tweet.target_account_profile_image_url ? (
                        <img
                          src={getProfileImageUrl(tweet.target_account_profile_image_url)}
                          alt={`@${tweet.target_account_username} のプロフィール画像`}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#1DA1F2',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '18px',
                          }}
                        >
                          {tweet.is_retweet && tweet.original_author_username
                            ? tweet.original_author_username.charAt(0).toUpperCase()
                            : tweet.target_account_username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* ツイート内容 */}
                    <div style={{ flex: 1 }}>
                      {/* ヘッダー */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <strong>
                          {tweet.is_retweet && tweet.original_author_display_name
                            ? tweet.original_author_display_name
                            : tweet.is_retweet && tweet.original_author_username
                              ? tweet.original_author_username
                              : tweet.is_retweet
                                ? '元ツイート作者'
                                : tweet.target_account_display_name || tweet.target_account_username}
                        </strong>
                        <span style={{ color: '#536471' }}>
                          @{tweet.is_retweet && tweet.original_author_username
                            ? tweet.original_author_username
                            : tweet.is_retweet
                              ? 'original_author'
                              : tweet.target_account_username}
                        </span>
                        <span className="separator">·</span>
                        <span style={{ color: '#536471', fontSize: '14px' }}>
                          {formatDate(tweet.posted_at)}
                        </span>
                        {tweet.is_reply && (
                          <span style={{
                            fontSize: '12px',
                            background: '#1DA1F2',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px'
                          }}>
                            返信
                          </span>
                        )}
                        {tweet.is_quote && (
                          <span style={{
                            fontSize: '12px',
                            background: '#17BF63',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px'
                          }}>
                            引用
                          </span>
                        )}
                      </div>

                      {/* ツイート本文 */}
                      <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                        {tweet.full_text || tweet.content}
                      </div>

                      {/* 引用ツイート表示 */}
                      {tweet.is_quote && tweet.quoted_tweet && (
                        <div className="quoted-tweet">
                          <div className="quoted-tweet-header">
                            {tweet.quoted_tweet.target_account_profile_image_url ? (
                              <img
                                src={getProfileImageUrl(tweet.quoted_tweet.target_account_profile_image_url)}
                                alt={`@${tweet.quoted_tweet.target_account_username} のプロフィール画像`}
                                className="quoted-tweet-avatar"
                              />
                            ) : (
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: '#1DA1F2',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {tweet.quoted_tweet.target_account_username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="quoted-tweet-author">
                              <span className="quoted-tweet-display-name">
                                {tweet.quoted_tweet.target_account_display_name ||
                                  tweet.quoted_tweet.target_account_username}
                              </span>
                              <span className="quoted-tweet-username">
                                @{tweet.quoted_tweet.target_account_username}
                              </span>
                              <span className="separator">·</span>
                              <span className="quoted-tweet-timestamp">
                                {formatDate(tweet.quoted_tweet.posted_at)}
                              </span>
                            </div>
                          </div>

                          {/* 引用元ツイート本文 */}
                          <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                            {tweet.quoted_tweet.full_text || tweet.quoted_tweet.content}
                          </div>

                          {/* 引用元ツイートのメディア */}
                          {tweet.quoted_tweet.media && tweet.quoted_tweet.media.length > 0 && (
                            <div style={{
                              marginTop: '8px',
                              maxWidth: '400px'
                            }}>
                              <div className={getMediaGridClass(tweet.quoted_tweet.media.length)}>
                                {tweet.quoted_tweet.media.map((media: any, index: number) => (
                                  <div
                                    key={media.media_key}
                                    className="media-item"
                                    onClick={() => handleMediaClick(media.media_url)}
                                  >
                                    {media.media_type === 'photo' ? (
                                      <img
                                        src={media.media_url}
                                        alt={media.alt_text || '引用ツイート画像'}
                                        loading="lazy"
                                      />
                                    ) : media.media_type === 'video' ? (
                                      <>
                                        <video
                                          src={media.media_url}
                                          muted
                                          preload="metadata"
                                        />
                                        <div className="media-overlay">
                                          <svg viewBox="0 0 24 24" className="play-icon">
                                            <path d="M8 5v14l11-7z" />
                                          </svg>
                                          動画
                                        </div>
                                      </>
                                    ) : media.media_type === 'animated_gif' ? (
                                      <>
                                        <video
                                          src={media.media_url}
                                          autoPlay
                                          loop
                                          muted
                                          playsInline
                                        />
                                        <div className="media-overlay">
                                          GIF
                                        </div>
                                      </>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 引用リツイートをリツイートした場合の引用元ツイート表示 */}
                      {tweet.is_retweet && !tweet.is_quote && tweet.quoted_tweet && (
                        <div className="quoted-tweet">
                          <div className="quoted-tweet-header">
                            {tweet.quoted_tweet.target_account_profile_image_url ? (
                              <img
                                src={getProfileImageUrl(tweet.quoted_tweet.target_account_profile_image_url)}
                                alt={`@${tweet.quoted_tweet.target_account_username} のプロフィール画像`}
                                className="quoted-tweet-avatar"
                              />
                            ) : (
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: '#1DA1F2',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {tweet.quoted_tweet.target_account_username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="quoted-tweet-author">
                              <span className="quoted-tweet-display-name">
                                {tweet.quoted_tweet.target_account_display_name ||
                                  tweet.quoted_tweet.target_account_username}
                              </span>
                              <span className="quoted-tweet-username">
                                @{tweet.quoted_tweet.target_account_username}
                              </span>
                              <span className="separator">·</span>
                              <span className="quoted-tweet-timestamp">
                                {formatDate(tweet.quoted_tweet.posted_at)}
                              </span>
                            </div>
                          </div>

                          {/* 引用元ツイート本文 */}
                          <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                            {tweet.quoted_tweet.full_text || tweet.quoted_tweet.content}
                          </div>

                          {/* 引用元ツイートのメディア */}
                          {tweet.quoted_tweet.media && tweet.quoted_tweet.media.length > 0 && (
                            <div style={{
                              marginTop: '8px',
                              maxWidth: '400px'
                            }}>
                              <div className={getMediaGridClass(tweet.quoted_tweet.media.length)}>
                                {tweet.quoted_tweet.media.map((media: any, index: number) => (
                                  <div
                                    key={media.media_key}
                                    className="media-item"
                                    onClick={() => handleMediaClick(media.media_url)}
                                  >
                                    {media.media_type === 'photo' ? (
                                      <img
                                        src={media.media_url}
                                        alt={media.alt_text || '引用ツイート画像'}
                                        loading="lazy"
                                      />
                                    ) : media.media_type === 'video' ? (
                                      <>
                                        <video
                                          src={media.media_url}
                                          muted
                                          preload="metadata"
                                        />
                                        <div className="media-overlay">
                                          <svg viewBox="0 0 24 24" className="play-icon">
                                            <path d="M8 5v14l11-7z" />
                                          </svg>
                                          動画
                                        </div>
                                      </>
                                    ) : media.media_type === 'animated_gif' ? (
                                      <>
                                        <video
                                          src={media.media_url}
                                          autoPlay
                                          loop
                                          muted
                                          playsInline
                                        />
                                        <div className="media-overlay">
                                          GIF
                                        </div>
                                      </>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* メディア表示 */}
                      {tweet.media && tweet.media.length > 0 && (
                        <div style={{
                          marginTop: '12px',
                          marginBottom: '12px',
                          maxWidth: '500px'
                        }}>
                          <div className={getMediaGridClass(tweet.media.length)}>
                            {tweet.media.map((media: any, index: number) => (
                              <div
                                key={media.media_key}
                                className="media-item"
                                onClick={() => handleMediaClick(media.media_url)}
                              >
                                {media.media_type === 'photo' ? (
                                  <img
                                    src={media.media_url}
                                    alt={media.alt_text || 'ツイート画像'}
                                    loading="lazy"
                                  />
                                ) : media.media_type === 'video' ? (
                                  <>
                                    <video
                                      src={media.media_url}
                                      muted
                                      preload="metadata"
                                    />
                                    <div className="media-overlay">
                                      <svg viewBox="0 0 24 24" className="play-icon">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                      動画
                                    </div>
                                  </>
                                ) : media.media_type === 'animated_gif' ? (
                                  <>
                                    <video
                                      src={media.media_url}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                    />
                                    <div className="media-overlay">
                                      GIF
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* エンゲージメント */}
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                        <span>❤️ {tweet.likes_count}</span>
                        <span>🔄 {tweet.retweets_count}</span>
                        <span>💬 {tweet.replies_count}</span>
                        {tweet.views_count && <span>👁️ {tweet.views_count}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div style={{
                padding: '1rem',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
              }}>
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
                    background: currentPage === totalPages ? '#f5f5f5' : 'white',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  次のページ
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#666'
          }}>
            このタイムラインにはまだツイートがありません。
            <br />
            ターゲットアカウントからツイートが取得されると表示されます。
          </div>
        )}
      </div>
    </div>
  );
}