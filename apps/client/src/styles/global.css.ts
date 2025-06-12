import { globalStyle } from '@vanilla-extract/css';

// グローバルスタイルをリセット
globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('html, body', {
  height: '100%',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Roboto"',
    '"Oxygen"',
    '"Ubuntu"',
    '"Cantarell"',
    '"Fira Sans"',
    '"Droid Sans"',
    '"Helvetica Neue"',
    'sans-serif',
  ].join(', '),
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('code', {
  fontFamily: [
    'source-code-pro',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Courier New"',
    'monospace',
  ].join(', '),
});

globalStyle('#app', {
  height: '100%',
});
