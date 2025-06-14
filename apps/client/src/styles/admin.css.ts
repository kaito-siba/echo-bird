import { style, styleVariants } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
  gap: '2rem',
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
});

export const headerControls = style({
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
});

export const searchInput = style({
  padding: '0.5rem 1rem',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  fontSize: '1rem',
  width: '300px',
  transition: 'border-color 0.2s',
  ':focus': {
    outline: 'none',
    borderColor: '#1976d2',
  },
});

export const errorContainer = style({
  padding: '20px',
  textAlign: 'center',
  color: 'red',
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const row = style({
  borderBottom: '1px solid #e0e0e0',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#f5f5f5',
  },
});

export const cell = style({
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.875rem',
});

const statusBadgeBase = style({
  display: 'inline-block',
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '500',
});

export const statusBadge = styleVariants({
  active: [
    statusBadgeBase,
    {
      backgroundColor: '#4caf50',
      color: 'white',
    },
  ],
  inactive: [
    statusBadgeBase,
    {
      backgroundColor: '#f44336',
      color: 'white',
    },
  ],
  admin: [
    statusBadgeBase,
    {
      backgroundColor: '#2196f3',
      color: 'white',
    },
  ],
  user: [
    statusBadgeBase,
    {
      backgroundColor: '#9e9e9e',
      color: 'white',
    },
  ],
});

export const actionButton = style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#1976d2',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#1565c0',
  },
});

export const createButton = style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#2196f3',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#1976d2',
  },
});

export const tableContainer = style({
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const tableHeader = style({
  backgroundColor: '#f5f5f5',
  fontWeight: '600',
});

export const tableRow = style({
  borderBottom: '1px solid #e0e0e0',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#f9f9f9',
  },
});

export const tableCell = style({
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.875rem',
  verticalAlign: 'middle',
});

export const button = style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'all 0.2s',
  cursor: 'pointer',
});

export const buttonGroup = style({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
});

export const editButton = style({
  padding: '0.25rem 0.75rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#4caf50',
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: '500',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#45a049',
  },
});

export const deleteButton = style({
  padding: '0.25rem 0.75rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#f44336',
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: '500',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#da190b',
  },
});
