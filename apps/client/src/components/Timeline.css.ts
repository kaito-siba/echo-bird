import { style, keyframes } from '@vanilla-extract/css';
import { colors } from '../styles/theme.css';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const fadeIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(10px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

export const timeline = style({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.white,
  borderRadius: '16px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
  border: `1px solid ${colors.gray[200]}`,
  animation: `${fadeIn} 0.3s ease-out`,
  width: '100%',
  maxWidth: '100%',

  '@media': {
    '(max-width: 640px)': {
      borderRadius: '0',
      border: 'none',
      boxShadow: 'none',
    },
  },
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: `1px solid ${colors.gray[200]}`,
  backgroundColor: colors.white,
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backdropFilter: 'blur(12px)',

  '@media': {
    '(max-width: 640px)': {
      padding: '16px 20px',
    },

    '(min-width: 1024px)': {
      padding: '24px 32px',
    },
  },
});

export const titleContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const title = style({
  fontSize: '20px',
  fontWeight: '800',
  color: colors.gray[900],
  lineHeight: '24px',
  letterSpacing: '-0.025em',

  '@media': {
    '(max-width: 640px)': {
      fontSize: '18px',
      lineHeight: '22px',
    },
  },
});

export const subtitle = style({
  fontSize: '14px',
  color: colors.gray[500],
  fontWeight: '400',
  lineHeight: '18px',
});

export const refreshButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '600',
  backgroundColor: colors.primary,
  color: colors.white,
  border: 'none',
  borderRadius: '24px',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  ':hover': {
    backgroundColor: colors.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px 0 rgba(29, 155, 240, 0.15)',
  },

  ':active': {
    transform: 'translateY(0)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },

  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },

  '@media': {
    '(max-width: 640px)': {
      padding: '8px 12px',
      fontSize: '13px',
    },
  },
});

export const refreshIcon = style({
  width: '16px',
  height: '16px',
  transition: 'transform 0.2s ease-in-out',
});

export const refreshIconSpinning = style([
  refreshIcon,
  {
    animation: `${spin} 1s linear infinite`,
  },
]);

export const tweetList = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '200px',
});

export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px 20px',
  gap: '16px',
});

export const loadingSpinner = style({
  width: '32px',
  height: '32px',
  border: `3px solid ${colors.gray[200]}`,
  borderTop: `3px solid ${colors.primary}`,
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

export const loadingText = style({
  fontSize: '14px',
  color: colors.gray[500],
  fontWeight: '500',
});

export const errorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '60px 20px',
  textAlign: 'center',
  gap: '16px',
});

export const errorIcon = style({
  width: '48px',
  height: '48px',
  color: colors.error,
  marginBottom: '8px',
});

export const errorMessage = style({
  fontSize: '16px',
  color: colors.error,
  fontWeight: '600',
  lineHeight: '24px',
});

export const errorDescription = style({
  fontSize: '14px',
  color: colors.gray[500],
  lineHeight: '20px',
  maxWidth: '400px',
});

export const retryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '600',
  backgroundColor: colors.gray[600],
  color: colors.white,
  border: 'none',
  borderRadius: '24px',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

  ':hover': {
    backgroundColor: colors.gray[700],
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
  },

  ':active': {
    transform: 'translateY(0)',
  },
});

export const emptyContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '80px 20px',
  textAlign: 'center',
  gap: '16px',
});

export const emptyIcon = style({
  width: '64px',
  height: '64px',
  color: colors.gray[300],
  marginBottom: '8px',
});

export const emptyTitle = style({
  fontSize: '20px',
  fontWeight: '700',
  color: colors.gray[700],
  lineHeight: '28px',
});

export const emptyDescription = style({
  fontSize: '15px',
  color: colors.gray[500],
  lineHeight: '22px',
  maxWidth: '400px',
});

export const paginationContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  padding: '24px',
  borderTop: `1px solid ${colors.gray[200]}`,
  backgroundColor: colors.gray[50],
});

export const paginationButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '600',
  backgroundColor: colors.white,
  color: colors.gray[700],
  border: `1px solid ${colors.gray[300]}`,
  borderRadius: '24px',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  ':hover': {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[400],
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
  },

  ':active': {
    transform: 'translateY(0)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },

  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: colors.gray[100],
    transform: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
});

export const paginationInfo = style({
  fontSize: '14px',
  color: colors.gray[500],
  fontWeight: '500',
  padding: '0 8px',
});

// 新しいスタイル：統計情報表示
export const statsContainer = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: colors.primaryLight,
  borderBottom: `1px solid ${colors.gray[200]}`,

  '@media': {
    '(max-width: 640px)': {
      padding: '12px 20px',
      flexDirection: 'column',
      gap: '8px',
    },
  },
});

export const statsItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',

  '@media': {
    '(max-width: 640px)': {
      flexDirection: 'row',
      gap: '8px',
    },
  },
});

export const statsNumber = style({
  fontSize: '18px',
  fontWeight: '700',
  color: colors.primary,
  lineHeight: '22px',
});

export const statsLabel = style({
  fontSize: '12px',
  color: colors.gray[600],
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});
