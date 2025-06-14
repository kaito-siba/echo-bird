import { style } from '@vanilla-extract/css';

// カラーパレット
const colors = {
  // グレースケール
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',

  // ブランドカラー
  primary: '#1d9bf0',
  primaryHover: '#1a8cd8',

  // アクションカラー
  like: '#f91880',
  retweet: '#00ba7c',
  reply: '#1d9bf0',
  share: '#64748b',

  // ステータスカラー
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export const tweetItem = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.gray200}`,
  backgroundColor: colors.white,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',

  ':hover': {
    backgroundColor: colors.gray50,
  },

  ':active': {
    backgroundColor: colors.gray100,
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
  backgroundColor: colors.gray300,
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
  backgroundColor: colors.gray300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.gray600,
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
  color: colors.gray900,
  lineHeight: '20px',

  ':hover': {
    textDecoration: 'underline',
  },
});

export const username = style({
  fontSize: '15px',
  color: colors.gray500,
  lineHeight: '20px',
  fontWeight: '400',
});

export const timestamp = style({
  fontSize: '15px',
  color: colors.gray500,
  lineHeight: '20px',
  fontWeight: '400',

  ':hover': {
    textDecoration: 'underline',
  },
});

export const separator = style({
  color: colors.gray400,
  margin: '0 2px',
});

export const text = style({
  fontSize: '15px',
  lineHeight: '20px',
  color: colors.gray900,
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
  color: colors.gray500,
  padding: '4px 8px',
  borderRadius: '12px',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',

  ':hover': {
    backgroundColor: colors.gray100,
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
    border: `1px solid #d1fae5`,
  },
]);

export const replyBadge = style([
  badge,
  {
    backgroundColor: '#eff6ff',
    color: colors.reply,
    border: `1px solid #dbeafe`,
  },
]);

export const quoteBadge = style([
  badge,
  {
    backgroundColor: '#fffbeb',
    color: colors.warning,
    border: `1px solid #fef3c7`,
  },
]);

export const retweetHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  paddingLeft: '52px', // アバターの幅 + gap分だけインデント
  fontSize: '13px',
  color: colors.gray500,
  fontWeight: '400',
  width: '100%',
});

export const retweetText = style({
  fontSize: '13px',
  color: colors.gray500,
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
