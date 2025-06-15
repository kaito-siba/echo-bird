import { style } from '@vanilla-extract/css';
import { colors } from './theme.css';

export const appContainer = style({
  minHeight: '100vh',
  backgroundColor: colors.gray[50],
  display: 'flex',
  flexDirection: 'column',
});

export const appLayout = style({
  display: 'flex',
  flex: 1,
  maxWidth: 'none',
  margin: '0 auto',
  width: '100%',

  '@media': {
    '(max-width: 1023px)': {
      flexDirection: 'column',
    },
  },
});

export const sidebar = style({
  width: '280px',
  backgroundColor: colors.white,
  borderRight: `1px solid ${colors.gray[200]}`,
  padding: '20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'fixed',
  top: '0',
  left: '0',
  height: '100vh',
  zIndex: '1000',
  overflowY: 'auto',

  '@media': {
    '(max-width: 1023px)': {
      position: 'relative',
      width: '100%',
      height: 'auto',
      borderRight: 'none',
      borderBottom: `1px solid ${colors.gray[200]}`,
      padding: '16px 20px',
    },
  },
});

export const sidebarCollapsed = style([
  sidebar,
  {
    width: '72px',

    '@media': {
      '(max-width: 1023px)': {
        position: 'relative',
        width: '100%',
        height: 'auto',
      },
    },
  },
]);

export const sidebarHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: `1px solid ${colors.gray[200]}`,
});

export const sidebarTitle = style({
  fontSize: '18px',
  fontWeight: '700',
  color: colors.gray[900],
  transition: 'opacity 0.2s ease-in-out',
});

export const sidebarTitleHidden = style([
  sidebarTitle,
  {
    opacity: 0,
    width: 0,

    '@media': {
      '(max-width: 1023px)': {
        opacity: 1,
      },
    },
  },
]);

export const toggleButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: 'transparent',
  border: `1px solid ${colors.gray[300]}`,
  color: colors.gray[600],
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',

  ':hover': {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[400],
  },

  '@media': {
    '(max-width: 1023px)': {
      display: 'none',
    },
  },
});

export const sidebarContent = style({
  transition: 'opacity 0.2s ease-in-out',
});

export const sidebarContentHidden = style([
  sidebarContent,
  {
    '@media': {
      '(max-width: 1023px)': {
        opacity: 1,
      },
    },
  },
]);

export const sidebarNav = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const navItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  color: colors.gray[700],
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  textAlign: 'left',
  justifyContent: 'flex-start',

  ':hover': {
    backgroundColor: colors.gray[100],
    color: colors.gray[900],
  },
});

export const navItemCollapsed = style([
  navItem,
  {
    justifyContent: 'center',
    padding: '12px 8px',
    gap: '0px',
  },
]);

export const navItemActive = style([
  navItem,
  {
    backgroundColor: colors.primary,
    color: colors.white,

    ':hover': {
      backgroundColor: colors.primaryHover,
      color: colors.white,
    },
  },
]);

export const navItemActiveCollapsed = style([
  navItemActive,
  {
    justifyContent: 'center',
    padding: '12px 8px',
    gap: '0px',
  },
]);

export const navIcon = style({
  width: '20px',
  height: '20px',
  flexShrink: 0,
});

export const navText = style({
  transition: 'opacity 0.2s ease-in-out',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});

export const navTextHidden = style([
  navText,
  {
    opacity: 0,
    width: 0,

    '@media': {
      '(max-width: 1023px)': {
        opacity: 1,
        width: 'auto',
      },
    },
  },
]);

export const mainContent = style({
  flex: 1,
  padding: '20px',
  minWidth: 0,
  marginLeft: '280px',

  '@media': {
    '(max-width: 1023px)': {
      marginLeft: '0',
      padding: '16px 20px',
    },

    '(max-width: 640px)': {
      marginLeft: '0',
      padding: '0',
    },
  },
});

// サイドバー折りたたみ時のメインコンテンツスタイル
export const mainContentCollapsed = style([
  mainContent,
  {
    marginLeft: '72px',

    '@media': {
      '(max-width: 1023px)': {
        marginLeft: '0',
      },
    },
  },
]);

// サイドバーの統計情報表示
export const statsSection = style({
  marginTop: '24px',
  padding: '16px',
  backgroundColor: colors.gray[50],
  borderRadius: '12px',
  border: `1px solid ${colors.gray[200]}`,
  transition: 'opacity 0.2s ease-in-out',
});

export const statsTitle = style({
  fontSize: '14px',
  fontWeight: '600',
  color: colors.gray[700],
  marginBottom: '12px',
});

export const statItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  fontSize: '13px',
  color: colors.gray[600],
});

export const statLabel = style({
  fontWeight: '500',
});

export const statValue = style({
  fontWeight: '600',
  color: colors.gray[900],
});

// サイドバーの統計情報表示 - 畳んだ状態では非表示
export const statsSectionHidden = style([
  statsSection,
  {
    opacity: 0,
    height: 0,
    padding: 0,
    marginTop: 0,
    overflow: 'hidden',

    '@media': {
      '(max-width: 1023px)': {
        opacity: 1,
        height: 'auto',
        padding: '16px',
        marginTop: '24px',
      },
    },
  },
]);

// ログアウトセクション - 畳んだ状態でも表示
export const logoutSection = style({
  marginTop: '24px',
});

// 畳んだ状態でのログアウトセクションのスタイル
export const logoutSectionCollapsed = style([
  logoutSection,
  {
    marginTop: '16px',
  },
]);

export const logoutButton = style([
  navItem,
  {
    color: '#dc2626', // より濃い赤色
    borderTop: `1px solid ${colors.gray[200]}`,
    paddingTop: '16px',
    marginTop: '16px',

    ':hover': {
      backgroundColor: '#fee2e2', // 薄い赤色の背景
      color: '#b91c1c', // ホバー時にさらに濃い赤色
    },
  },
]);

// 畳んだ状態でのログアウトボタンのスタイル
export const logoutButtonCollapsed = style([
  logoutButton,
  {
    justifyContent: 'center',
    padding: '12px 8px',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: 'none',
    gap: '0px',
  },
]);
