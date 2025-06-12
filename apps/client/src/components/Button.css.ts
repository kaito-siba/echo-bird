import { style, styleVariants } from '@vanilla-extract/css';

// ベーススタイル
export const button = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: '500',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  textDecoration: 'none',

  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  ':focus': {
    outline: 'none',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
  },
});

// バリアント
export const buttonVariants = styleVariants({
  primary: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    ':hover': {
      backgroundColor: '#2563eb',
    },
  },
  secondary: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    ':hover': {
      backgroundColor: '#4b5563',
    },
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    ':hover': {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#374151',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
});

// サイズバリアント
export const buttonSizes = styleVariants({
  sm: {
    padding: '8px 16px',
    fontSize: '14px',
  },
  md: {
    padding: '12px 24px',
    fontSize: '16px',
  },
  lg: {
    padding: '16px 32px',
    fontSize: '18px',
  },
});
