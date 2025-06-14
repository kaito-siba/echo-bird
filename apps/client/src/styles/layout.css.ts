import { style } from '@vanilla-extract/css';

// カラーパレット（他のコンポーネントと統一）
const colors = {
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
  primary: '#1d9bf0',
  primaryHover: '#1a8cd8',
};

export const appContainer = style({
  minHeight: '100vh',
  backgroundColor: colors.gray50,
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
  borderRight: `1px solid ${colors.gray200}`,
  padding: '20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',

  '@media': {
    '(max-width: 1023px)': {
      width: '100%',
      borderRight: 'none',
      borderBottom: `1px solid ${colors.gray200}`,
      padding: '16px 20px',
    },
  },
});

export const sidebarCollapsed = style([
  sidebar,
  {
    width: '80px',

    '@media': {
      '(max-width: 1023px)': {
        width: '100%',
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
  borderBottom: `1px solid ${colors.gray200}`,
});

export const sidebarTitle = style({
  fontSize: '18px',
  fontWeight: '700',
  color: colors.gray900,
  transition: 'opacity 0.2s ease-in-out',
});

export const sidebarTitleHidden = style([
  sidebarTitle,
  {
    opacity: 0,

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
  border: `1px solid ${colors.gray300}`,
  color: colors.gray600,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',

  ':hover': {
    backgroundColor: colors.gray100,
    borderColor: colors.gray400,
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
    opacity: 0,

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
  color: colors.gray700,
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  textAlign: 'left',

  ':hover': {
    backgroundColor: colors.gray100,
    color: colors.gray900,
  },
});

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

export const navIcon = style({
  width: '20px',
  height: '20px',
  flexShrink: 0,
});

export const navText = style({
  transition: 'opacity 0.2s ease-in-out',
});

export const navTextHidden = style([
  navText,
  {
    opacity: 0,

    '@media': {
      '(max-width: 1023px)': {
        opacity: 1,
      },
    },
  },
]);

export const mainContent = style({
  flex: 1,
  padding: '20px',
  minWidth: 0,

  '@media': {
    '(max-width: 1023px)': {
      padding: '16px 20px',
    },

    '(max-width: 640px)': {
      padding: '0',
    },
  },
});

// サイドバーの統計情報表示
export const statsSection = style({
  marginTop: '24px',
  padding: '16px',
  backgroundColor: colors.gray50,
  borderRadius: '12px',
  border: `1px solid ${colors.gray200}`,
});

export const statsTitle = style({
  fontSize: '14px',
  fontWeight: '600',
  color: colors.gray700,
  marginBottom: '12px',
});

export const statItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  fontSize: '13px',
  color: colors.gray600,
});

export const statLabel = style({
  fontWeight: '500',
});

export const statValue = style({
  fontWeight: '600',
  color: colors.gray900,
});
