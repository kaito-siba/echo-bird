import { style } from '@vanilla-extract/css';

// サイドバー全体
export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: '0',
  left: '0',
  width: '280px',
  height: '100vh',
  backgroundColor: '#1e293b',
  color: 'white',
  boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
  zIndex: '1000',
});

// サイドバーヘッダー
export const sidebarHeader = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem',
  borderBottom: '1px solid #374151',
  gap: '0.5rem',
});

// ユーザー情報表示
export const userInfo = style({
  fontSize: '0.875rem',
  color: '#9ca3af',
  fontWeight: '500',
});

// ナビゲーション
export const sidebarNav = style({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  padding: '1rem 0',
  gap: '0.25rem',
});

// ナビゲーションアイテム
export const sidebarNavItem = style({
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1.5rem',
  color: '#d1d5db',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: '500',
  gap: '0.75rem',
  transition: 'background-color 0.2s, color 0.2s',

  ':hover': {
    backgroundColor: '#374151',
    color: 'white',
  },

  // アクティブ状態のスタイル
  selectors: {
    '&[data-status="active"]': {
      backgroundColor: '#1976d2',
      color: 'white',
    },
  },
});

// アクティブなナビゲーションアイテム（追加クラス用）
export const sidebarNavItemActive = style({
  backgroundColor: '#1976d2',
  color: 'white',
});

// サイドバーフッター
export const sidebarFooter = style({
  padding: '1rem',
  borderTop: '1px solid #374151',
});

// ログアウトボタン
export const logoutButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: '500',
  gap: '0.5rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s',

  ':hover': {
    backgroundColor: '#b91c1c',
  },

  ':disabled': {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
  },
});
