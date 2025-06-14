import { style } from '@vanilla-extract/css';

// レイアウト全体のコンテナ
export const layoutContainer = style({
  display: 'flex',
  minHeight: '100vh',
});

// メインコンテンツ（サイドバーなし）
export const mainContent = style({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  width: '100%',
});

// メインコンテンツ（サイドバーあり）
export const mainContentWithSidebar = style({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  marginLeft: '280px', // サイドバーの幅と同じ
  width: 'calc(100% - 280px)',
});
