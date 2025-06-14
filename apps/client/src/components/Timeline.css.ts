import { style, keyframes } from '@vanilla-extract/css';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const timeline = style({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
});

export const title = style({
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
});

export const subtitle = style({
  fontSize: '14px',
  color: '#6b7280',
  marginTop: '2px',
});

export const refreshButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: '500',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',

  ':hover': {
    backgroundColor: '#2563eb',
  },

  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

export const tweetList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const loadingContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px 20px',
});

export const loadingSpinner = style({
  width: '32px',
  height: '32px',
  border: '3px solid #e5e7eb',
  borderTop: '3px solid #3b82f6',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

export const errorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px 20px',
  textAlign: 'center',
});

export const errorMessage = style({
  fontSize: '16px',
  color: '#ef4444',
  marginBottom: '16px',
});

export const retryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: '500',
  backgroundColor: '#6b7280',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',

  ':hover': {
    backgroundColor: '#4b5563',
  },
});

export const emptyContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '60px 20px',
  textAlign: 'center',
});

export const emptyIcon = style({
  width: '64px',
  height: '64px',
  color: '#d1d5db',
  marginBottom: '16px',
});

export const emptyTitle = style({
  fontSize: '18px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px',
});

export const emptyDescription = style({
  fontSize: '14px',
  color: '#6b7280',
  maxWidth: '400px',
});

export const paginationContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  padding: '20px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
});

export const paginationButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: '500',
  backgroundColor: '#ffffff',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',

  ':hover': {
    backgroundColor: '#f3f4f6',
    borderColor: '#9ca3af',
  },

  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: '#f9fafb',
  },
});

export const paginationInfo = style({
  fontSize: '14px',
  color: '#6b7280',
});
