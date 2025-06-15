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

// メディア表示用スタイル
export const mediaContainer = style({
  marginTop: '12px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: `1px solid ${colors.gray[200]}`,
  backgroundColor: colors.gray[50],
  maxWidth: '500px',
  width: '100%',
});

export const mediaGrid = style({
  display: 'grid',
  gap: '2px',
});

export const mediaGridSingle = style([
  mediaGrid,
  {
    gridTemplateColumns: '1fr',
  },
]);

export const mediaGridDouble = style([
  mediaGrid,
  {
    gridTemplateColumns: '1fr 1fr',
  },
]);

export const mediaGridTriple = style([
  mediaGrid,
  {
    gridTemplateColumns: '1fr 1fr',
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
  backgroundColor: colors.gray[100],
  minHeight: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',

  ':hover': {
    transform: 'scale(1.02)',
  },
});

export const mediaImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

export const mediaVideo = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

export const mediaOverlay = style({
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: colors.white,
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const playIcon = style({
  width: '12px',
  height: '12px',
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
