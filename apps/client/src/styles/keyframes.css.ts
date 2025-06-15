import { keyframes } from '@vanilla-extract/css';

export const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

// スライドインアニメーション
export const slideIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(-10px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

// フロートアニメーション（背景効果用）
export const float = keyframes({
  '0%, 100%': {
    transform: 'translate(0, 0) scale(1)',
  },
  '25%': {
    transform: 'translate(30px, -30px) scale(1.05)',
  },
  '50%': {
    transform: 'translate(-20px, 20px) scale(0.95)',
  },
  '75%': {
    transform: 'translate(20px, -10px) scale(1.02)',
  },
});
