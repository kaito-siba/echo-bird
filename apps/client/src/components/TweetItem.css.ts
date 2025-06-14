import { style } from '@vanilla-extract/css';

export const tweetItem = style({
  display: 'flex',
  padding: '16px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  gap: '12px',
  transition: 'background-color 0.2s ease-in-out',

  ':hover': {
    backgroundColor: '#f9fafb',
  },
});

export const avatar = style({
  width: '48px',
  height: '48px',
  borderRadius: '24px',
  backgroundColor: '#d1d5db',
  flexShrink: 0,
  objectFit: 'cover',
});

export const avatarFallback = style({
  width: '48px',
  height: '48px',
  borderRadius: '24px',
  backgroundColor: '#d1d5db',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6b7280',
  fontSize: '20px',
  fontWeight: 'bold',
  flexShrink: 0,
});

export const content = style({
  flex: 1,
  minWidth: 0,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
});

export const displayName = style({
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
});

export const username = style({
  fontSize: '14px',
  color: '#6b7280',
});

export const timestamp = style({
  fontSize: '14px',
  color: '#6b7280',
});

export const separator = style({
  color: '#d1d5db',
});

export const text = style({
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#111827',
  marginBottom: '8px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const engagementStats = style({
  display: 'flex',
  gap: '16px',
  marginTop: '8px',
});

export const statItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '14px',
  color: '#6b7280',
});

export const statNumber = style({
  fontWeight: '500',
});

export const replyIcon = style({
  color: '#6b7280',
});

export const retweetIcon = style({
  color: '#10b981',
});

export const likeIcon = style({
  color: '#ef4444',
});

export const shareIcon = style({
  color: '#6b7280',
});

export const badge = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 6px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
  marginLeft: '8px',
});

export const retweetBadge = style([
  badge,
  {
    backgroundColor: '#d1fae5',
    color: '#047857',
  },
]);

export const replyBadge = style([
  badge,
  {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
]);

export const quoteBadge = style([
  badge,
  {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
]);

export const retweetHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  paddingLeft: '60px', // プロフィール画像の幅分だけインデント
  fontSize: '14px',
  color: '#6b7280',
});

export const retweetText = style({
  fontSize: '14px',
  color: '#6b7280',
});
