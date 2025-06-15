import { style } from '@vanilla-extract/css';
import { slideIn, spin } from './keyframes.css';
import { colors, fontSize, spacing } from './theme.css';

// ログインページ全体のコンテナ
export const loginContainer = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: spacing['2xl'],
  backgroundColor: colors.gray[50],
  position: 'relative',
  '@media': {
    '(max-width: 640px)': {
      padding: spacing.md,
    },
  },
});

// ログインフォームのカード
export const loginCard = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '360px',
  padding: spacing.lg,
  backgroundColor: colors.white,
  borderRadius: '12px',
  boxShadow:
    '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${colors.gray[300]}`,
  gap: spacing.md,
  position: 'relative',
  transition:
    'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  ':hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.15)',
  },
  '@media': {
    '(max-width: 640px)': {
      padding: spacing.md,
      maxWidth: '100%',
      borderRadius: '0',
      border: 'none',
      boxShadow: 'none',
    },
  },
});

// サービス名（フォーム外）
export const serviceName = style({
  fontSize: fontSize['3xl'],
  fontWeight: '800',
  textAlign: 'center',
  color: colors.primary,
  margin: '0',
  marginBottom: spacing.lg,
  letterSpacing: '-0.025em',
  lineHeight: '36px',
});

// ログインフォームのタイトル
export const loginTitle = style({
  fontSize: fontSize.xl,
  fontWeight: '700',
  textAlign: 'center',
  color: colors.gray[900],
  margin: '0',
  letterSpacing: '-0.025em',
  lineHeight: '24px',
});

// フォームグループ（ラベル+入力フィールドのセット）
export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  position: 'relative',
});

// フォームラベル
export const formLabel = style({
  fontSize: fontSize.sm,
  fontWeight: '600',
  color: colors.gray[700],
  letterSpacing: '0.025em',
});

// 入力フィールド
export const formInput = style({
  width: '100%',
  padding: `${spacing.md} ${spacing.sm} ${spacing.md} 2.5rem`,
  border: `1px solid ${colors.gray[300]}`,
  borderRadius: '8px',
  fontSize: fontSize.base,
  backgroundColor: colors.white,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  textAlign: 'left',
  ':focus': {
    outline: 'none',
    borderColor: colors.primary,
    backgroundColor: colors.white,
    boxShadow: `0 0 0 2px rgba(29, 155, 240, 0.1)`,
  },
  '::placeholder': {
    color: colors.gray[500],
    fontSize: fontSize.sm,
    textAlign: 'left',
  },
});

// ログインボタン
export const loginButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.xs,
  padding: `${spacing.md} ${spacing.lg}`,
  border: 'none',
  borderRadius: '8px',
  backgroundColor: colors.primary,
  color: colors.white,
  fontSize: fontSize.base,
  fontWeight: '600',
  letterSpacing: '0.025em',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  ':hover': {
    backgroundColor: colors.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px 0 rgba(29, 155, 240, 0.15)',
  },
  ':active': {
    transform: 'translateY(0)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: colors.gray[400],
    transform: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
});

// エラーメッセージ
export const errorMessage = style({
  padding: spacing.md,
  backgroundColor: '#fef2f2',
  color: colors.error,
  borderRadius: '12px',
  fontSize: fontSize.sm,
  fontWeight: '500',
  border: `1px solid #fecaca`,
  animation: `${slideIn} 0.3s ease`,
});

// 成功メッセージ
export const successMessage = style({
  padding: spacing.md,
  backgroundColor: '#f0fdf4',
  color: colors.success,
  borderRadius: '12px',
  fontSize: fontSize.sm,
  fontWeight: '500',
  border: `1px solid #bbf7d0`,
  animation: `${slideIn} 0.3s ease`,
});

// ローディング状態のスピナー
export const loadingSpinner = style({
  display: 'inline-block',
  width: '20px',
  height: '20px',
  border: `3px solid rgba(255, 255, 255, 0.3)`,
  borderTop: `3px solid ${colors.white}`,
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

// インプットフィールドのアイコンラッパー
export const inputIconWrapper = style({
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: colors.gray[600],
  pointerEvents: 'none',
  transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1,
});

// フォーカス時のアイコンスタイル
export const inputIconFocused = style({
  color: colors.primary,
});

// インプットフィールドのコンテナ
export const inputContainer = style({
  position: 'relative',
  width: '100%',
});

// フォーム全体のコンテナ
export const formContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.lg,
});
