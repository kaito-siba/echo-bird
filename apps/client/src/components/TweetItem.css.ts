import { style } from '@vanilla-extract/css';
import { colors } from '../styles/theme.css';

export const tweetItem = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.gray[200]}`,
  backgroundColor: colors.white,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',

  ':hover': {
    backgroundColor: colors.gray[50],
  },

  ':active': {
    backgroundColor: colors.gray[100],
  },

  // フォーカス時のアクセシビリティ
  ':focus-visible': {
    outline: `2px solid ${colors.primary}`,
    outlineOffset: '-2px',
  },
});

export const mainContent = style({
  display: 'flex',
  gap: '12px',
});

export const avatar = style({
  width: '40px',
  height: '40px',
  borderRadius: '20px',
  backgroundColor: colors.gray[300],
  flexShrink: 0,
  objectFit: 'cover',
  border: `2px solid ${colors.white}`,
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out',

  ':hover': {
    transform: 'scale(1.05)',
  },
});

export const avatarFallback = style({
  width: '40px',
  height: '40px',
  borderRadius: '20px',
  backgroundColor: colors.gray[300],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.gray[600],
  fontSize: '16px',
  fontWeight: '600',
  flexShrink: 0,
  border: `2px solid ${colors.white}`,
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
});

export const content = style({
  flex: 1,
  minWidth: 0,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginBottom: '2px',
  flexWrap: 'wrap',
});

export const displayName = style({
  fontSize: '15px',
  fontWeight: '700',
  color: colors.gray[900],
  lineHeight: '20px',

  ':hover': {
    textDecoration: 'underline',
  },
});

export const username = style({
  fontSize: '15px',
  color: colors.gray[500],
  lineHeight: '20px',
  fontWeight: '400',
});

export const timestamp = style({
  fontSize: '15px',
  color: colors.gray[500],
  lineHeight: '20px',
  fontWeight: '400',

  ':hover': {
    textDecoration: 'underline',
  },
});

export const separator = style({
  color: colors.gray[400],
  margin: '0 2px',
});

export const text = style({
  fontSize: '15px',
  lineHeight: '20px',
  color: colors.gray[900],
  marginBottom: '12px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontWeight: '400',
});

export const engagementStats = style({
  display: 'flex',
  gap: '20px',
  marginTop: '12px',
  paddingTop: '2px',
});

export const statItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  color: colors.gray[500],
  padding: '4px 8px',
  borderRadius: '12px',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',

  ':hover': {
    backgroundColor: colors.gray[100],
  },
});

export const statNumber = style({
  fontWeight: '600',
  fontSize: '13px',
});

export const replyIcon = style({
  color: colors.reply,
  width: '16px',
  height: '16px',
});

export const retweetIcon = style({
  color: colors.retweet,
  width: '16px',
  height: '16px',
});

export const likeIcon = style({
  color: colors.like,
  width: '16px',
  height: '16px',
});

export const shareIcon = style({
  color: colors.share,
  width: '16px',
  height: '16px',
});

export const bookmarkIcon = style({
  color: colors.gray[500],
  width: '16px',
  height: '16px',
  transition: 'color 0.2s ease-in-out',
});

export const bookmarkIconActive = style([
  bookmarkIcon,
  {
    color: colors.primary,
  },
]);

export const externalLinkButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px',
  marginLeft: 'auto',
  borderRadius: '8px',
  transition: 'all 0.2s ease-in-out',
  color: colors.gray[500],
  textDecoration: 'none',

  ':hover': {
    backgroundColor: colors.gray[100],
    color: colors.primary,
  },

  ':active': {
    backgroundColor: colors.gray[200],
  },
});

export const externalLinkIcon = style({
  width: '16px',
  height: '16px',
});

export const badge = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '600',
  marginLeft: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
});

export const retweetBadge = style([
  badge,
  {
    backgroundColor: '#ecfdf5',
    color: colors.retweet,
    border: '1px solid #d1fae5',
  },
]);

export const replyBadge = style([
  badge,
  {
    backgroundColor: '#eff6ff',
    color: colors.reply,
    border: '1px solid #dbeafe',
  },
]);

export const quoteBadge = style([
  badge,
  {
    backgroundColor: '#fffbeb',
    color: colors.warning,
    border: '1px solid #fef3c7',
  },
]);

export const retweetHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  paddingLeft: '52px', // アバターの幅 + gap分だけインデント
  fontSize: '13px',
  color: colors.gray[500],
  fontWeight: '400',
  width: '100%',
});

export const retweetText = style({
  fontSize: '13px',
  color: colors.gray[500],
  fontWeight: '400',
});

// レスポンシブ対応
export const responsiveContainer = style({
  '@media': {
    '(max-width: 640px)': {
      padding: '12px',
    },

    '(min-width: 1024px)': {
      padding: '16px 24px',
    },
  },
});

export const responsiveAvatar = style({
  '@media': {
    '(max-width: 640px)': {
      width: '36px',
      height: '36px',
      borderRadius: '18px',
    },
  },
});

export const responsiveText = style({
  '@media': {
    '(max-width: 640px)': {
      fontSize: '14px',
      lineHeight: '18px',
    },
  },
});

export const responsiveMediaContainer = style({
  '@media': {
    '(max-width: 640px)': {
      maxWidth: '100%',
    },
    '(max-width: 480px)': {
      maxWidth: 'calc(100vw - 80px)', // 画面幅から余白を引いた値
    },
  },
});

// メディア表示用スタイル - 公式Twitter風の柔軟レイアウト
export const mediaContainer = style({
  marginTop: '12px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: `1px solid ${colors.gray[300]}`,
  backgroundColor: colors.gray[100],
  maxWidth: '500px',
  width: '100%',
  // 複数メディアの場合は柔軟な高さ調整
  maxHeight: '400px',
});

export const mediaGrid = style({
  display: 'grid',
  gap: '1px',
  height: '100%',
  width: '100%',
});

export const mediaGridSingle = style([
  mediaGrid,
  {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
  },
]);

export const mediaGridDouble = style([
  mediaGrid,
  {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
  },
]);

// 横長画像用の縦並びレイアウト
export const mediaGridDoubleVertical = style([
  mediaGrid,
  {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 1fr',
    height: 'auto',
    maxHeight: '600px',
  },
]);

export const mediaGridTriple = style([
  mediaGrid,
  {
    gridTemplateColumns: '2fr 1fr',
    gridTemplateRows: '1fr 1fr',
  },
]);

export const mediaGridQuad = style([
  mediaGrid,
  {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
  },
]);

export const mediaItem = style({
  position: 'relative',
  backgroundColor: colors.gray[200],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'filter 0.2s ease-in-out',

  ':hover': {
    filter: 'brightness(0.95)',
  },
});

// 単一メディア用のスタイル - メディアサイズに適応
export const mediaItemSingle = style([
  mediaItem,
  {
    // 単一メディアの場合はメディアの自然なサイズに合わせる
    minHeight: 'auto',
    maxHeight: '400px',
    width: 'auto',
    height: 'auto',
    display: 'block',
  },
]);

// 単一メディア用のコンテナスタイル（メディアサイズに合わせる）
export const mediaContainerSingle = style([
  {
    marginTop: '12px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: `1px solid ${colors.gray[300]}`,
    backgroundColor: colors.gray[100],
    maxWidth: '500px',
    width: 'fit-content', // メディアサイズに合わせる
    maxHeight: '400px',
    display: 'inline-block', // コンテンツサイズに合わせる
  },
]);

// 単一メディア用の画像スタイル（外枠フィット）
export const mediaImage = style({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain', // 画像全体を表示領域内に収める
  objectPosition: 'center',
  display: 'block',
  backgroundColor: colors.gray[100], // 余白部分の背景色
});

// 複数メディア用の画像スタイル（セクション埋め）
export const mediaImageMultiple = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover', // 画像をクロップしてセクションを完全に埋める
  objectPosition: 'center',
  display: 'block',
});

// 単一メディア用の動画スタイル（外枠フィット）
export const mediaVideo = style({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain', // 動画全体を表示領域内に収める
  objectPosition: 'center',
  display: 'block',
  backgroundColor: colors.gray[100], // 余白部分の背景色
});

// 複数メディア用の動画スタイル（セクション埋め）
export const mediaVideoMultiple = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover', // 動画をクロップしてセクションを完全に埋める
  objectPosition: 'center',
  display: 'block',
});

export const mediaOverlay = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: colors.white,
  padding: '8px 12px',
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  // スムーズなフェードアウト効果
  transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
  opacity: 1,
  visibility: 'visible',
});

// ホバー時に非表示にするオーバーレイスタイル
export const mediaOverlayHidden = style([
  mediaOverlay,
  {
    opacity: 0,
    visibility: 'hidden',
  },
]);

export const playIcon = style({
  width: '16px',
  height: '16px',
  fill: 'currentColor',
});

export const gifIcon = style({
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.5px',
});

// メディアグリッドでの特別な配置（3つの場合）
export const mediaItemLarge = style([
  mediaItem,
  {
    gridRow: 'span 2',
  },
]);

export const mediaItemSmall = style([
  mediaItem,
  {
    gridRow: 'span 1',
  },
]);

// 横長画像用のメディアアイテム（高さ調整）
export const mediaItemWide = style([
  mediaItem,
  {
    aspectRatio: '16 / 9', // 横長画像に適した比率
    minHeight: '150px',
    maxHeight: '200px',
  },
]);

export const mediaPlaceholder = style({
  color: colors.gray[600],
  fontSize: '14px',
  fontWeight: '600',
});

// 引用ツイート用スタイル
export const quotedTweetContainer = style({
  marginTop: '12px',
  border: `1px solid ${colors.gray[200]}`,
  borderRadius: '12px',
  padding: '12px',
  backgroundColor: colors.gray[50],
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',

  ':hover': {
    backgroundColor: colors.gray[100],
  },
});

export const quotedTweetHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
});

export const quotedTweetAvatar = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  objectFit: 'cover',
  flexShrink: 0,
});

export const quotedTweetAvatarFallback = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: colors.gray[300],
  color: colors.gray[600],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  fontWeight: '600',
  flexShrink: 0,
});

export const quotedTweetAuthor = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '14px',
  minWidth: 0, // flexアイテムの縮小を許可
});

export const quotedTweetDisplayName = style({
  fontWeight: '600',
  color: colors.gray[900],
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px', // 通常ツイートと同じレベルに拡大
});

export const quotedTweetUsername = style({
  color: colors.gray[500],
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '150px', // 通常ツイートと同じレベルに拡大
});

export const quotedTweetTimestamp = style({
  color: colors.gray[500],
  fontSize: '13px',
  whiteSpace: 'nowrap',
});

export const quotedTweetText = style({
  fontSize: '14px',
  lineHeight: '18px',
  color: colors.gray[800],
  marginBottom: '8px',
  wordWrap: 'break-word',
  whiteSpace: 'pre-wrap',
});

// 引用ツイート用の複数メディアコンテナ（柔軟レイアウト）
export const quotedTweetMediaContainer = style({
  marginTop: '8px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: `1px solid ${colors.gray[300]}`,
  backgroundColor: colors.gray[100],
  maxWidth: '450px', // 引用ツイートのメディアを少し大きめに
  width: '100%',
  // 複数メディアの場合は柔軟な高さ調整
  maxHeight: '300px',
});

// 引用ツイート用の単一メディアコンテナ（メディアサイズに合わせる）
export const quotedTweetMediaContainerSingle = style({
  marginTop: '8px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: `1px solid ${colors.gray[300]}`,
  backgroundColor: colors.gray[100],
  maxWidth: '450px',
  width: 'fit-content', // メディアサイズに合わせる
  maxHeight: '250px',
  display: 'inline-block', // コンテンツサイズに合わせる
});

// 引用ツイート用の単一メディアアイテム
export const quotedTweetMediaItemSingle = style([
  mediaItem,
  {
    minHeight: 'auto',
    maxHeight: '250px',
    width: 'auto',
    height: 'auto',
    display: 'block',
  },
]);

// 引用ツイート用の横長メディアアイテム
export const quotedTweetMediaItemWide = style([
  mediaItem,
  {
    aspectRatio: '16 / 9',
    minHeight: '100px',
    maxHeight: '150px',
  },
]);

// 引用ツイート用の単一メディア画像スタイル（外枠フィット）
export const quotedTweetMediaImage = style({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  objectPosition: 'center',
  display: 'block',
  backgroundColor: colors.gray[100],
});

// 引用ツイート用の複数メディア画像スタイル（セクション埋め）
export const quotedTweetMediaImageMultiple = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
});

// 引用ツイート用の単一メディア動画スタイル（外枠フィット）
export const quotedTweetMediaVideo = style({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  objectPosition: 'center',
  display: 'block',
  backgroundColor: colors.gray[100],
});

// 引用ツイート用の複数メディア動画スタイル（セクション埋め）
export const quotedTweetMediaVideoMultiple = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
});

export const placeholderMedia = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.gray[100],
  color: colors.gray[500],
  fontSize: '12px',
  fontWeight: '500',
  height: '100%',
  minHeight: '100px',
});
