import { style } from '@vanilla-extract/css'
import { spin } from './keyframes.css'

// ログインページ全体のコンテナ
export const loginContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '2rem',
  backgroundColor: '#f5f5f5',
})

// ログインフォームのカード
export const loginCard = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '400px',
  padding: '2rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  gap: '1.5rem',
})

// ログインフォームのタイトル
export const loginTitle = style({
  fontSize: '1.5rem',
  fontWeight: '600',
  textAlign: 'center',
  color: '#333',
  margin: '0',
})

// フォームグループ（ラベル+入力フィールドのセット）
export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
})

// フォームラベル
export const formLabel = style({
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#555',
})

// 入力フィールド
export const formInput = style({
  padding: '0.75rem',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  fontSize: '1rem',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  ':focus': {
    outline: 'none',
    borderColor: '#1976d2',
    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
  },
})

// ログインボタン
export const loginButton = style({
  padding: '0.75rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#1976d2',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#1565c0',
  },
  ':disabled': {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
})

// エラーメッセージ
export const errorMessage = style({
  padding: '0.75rem',
  backgroundColor: '#ffebee',
  color: '#c62828',
  borderRadius: '4px',
  fontSize: '0.875rem',
  border: '1px solid #ffcdd2',
})

// 成功メッセージ
export const successMessage = style({
  padding: '0.75rem',
  backgroundColor: '#e8f5e8',
  color: '#2e7d32',
  borderRadius: '4px',
  fontSize: '0.875rem',
  border: '1px solid #c8e6c9',
})

// ローディング状態のスピナー
export const loadingSpinner = style({
  display: 'inline-block',
  width: '20px',
  height: '20px',
  border: '2px solid #fff',
  borderTop: '2px solid transparent',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
})