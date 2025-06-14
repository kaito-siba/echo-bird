import { style } from '@vanilla-extract/css';
import { colors } from './theme.css';

export const timelineContainer = style({
  maxWidth: '800px',
  margin: '0 auto',
  width: '100%',
});

export const timelineHeader = style({
  padding: '20px 24px',
  borderBottom: `1px solid ${colors.gray[200]}`,
  backgroundColor: colors.white,
  position: 'sticky',
  top: 0,
  zIndex: 10,
});

export const timelineTitle = style({
  fontSize: '20px',
  fontWeight: '800',
  color: colors.gray[900],
  lineHeight: '24px',
  letterSpacing: '-0.025em',
  margin: 0,
});

export const timelineSubtitle = style({
  fontSize: '13px',
  color: colors.gray[500],
  fontWeight: '400',
  marginTop: '2px',
});
