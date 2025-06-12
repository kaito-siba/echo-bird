import { style } from '@vanilla-extract/css';
import { spin } from './keyframes.css';

export const containerStyle = style({
  textAlign: 'center',
});

export const headerStyle = style({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#282c34',
  color: 'white',
  fontSize: 'calc(10px + 2vmin)',
});

export const logoStyle = style({
  height: '40vmin',
  pointerEvents: 'none',
  animation: `${spin} 20s linear infinite`,
});

export const linkStyle = style({
  color: '#61dafb',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});
