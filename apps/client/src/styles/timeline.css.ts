import { style } from '@vanilla-extract/css';

// カラーパレット（他のコンポーネントと統一）
const colors = {
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
};

export const timelineContainer = style({
  maxWidth: '800px',
  margin: '0 auto',
  width: '100%',
});
