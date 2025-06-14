import { createTheme } from '@vanilla-extract/css';

// 共通カラーパレット
export const colors = {
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // ブランドカラー
  primary: '#1d9bf0',
  primaryHover: '#1a8cd8',
  primaryLight: '#e0f2fe',

  // Twitter カラー
  twitter: '#1da1f2',

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

// スペーシング
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// フォントサイズ
export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
};

// ブレイクポイント
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

// テーマ作成
export const [themeClass, vars] = createTheme({
  colors,
  spacing,
  fontSize,
});
