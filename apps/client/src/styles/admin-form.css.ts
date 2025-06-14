import { style } from '@vanilla-extract/css';

export const formContainer = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '2rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const formHeader = style({
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid #e0e0e0',
});

export const formGroup = style({
  marginBottom: '1.5rem',
});

export const label = style({
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#333',
});

export const input = style({
  display: 'block',
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  fontSize: '1rem',
  transition: 'border-color 0.2s',
  ':focus': {
    outline: 'none',
    borderColor: '#1976d2',
  },
});

export const select = style({
  display: 'block',
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  fontSize: '1rem',
  backgroundColor: 'white',
  transition: 'border-color 0.2s',
  cursor: 'pointer',
  ':focus': {
    outline: 'none',
    borderColor: '#1976d2',
  },
});

export const checkbox = style({
  marginRight: '0.5rem',
  width: '1rem',
  height: '1rem',
  cursor: 'pointer',
});

export const buttonGroup = style({
  display: 'flex',
  gap: '1rem',
  marginTop: '2rem',
  paddingTop: '2rem',
  borderTop: '1px solid #e0e0e0',
});

export const saveButton = style({
  padding: '0.75rem 2rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#1976d2',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '500',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#1565c0',
  },
});

export const cancelButton = style({
  padding: '0.75rem 2rem',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: 'white',
  color: '#666',
  fontSize: '1rem',
  fontWeight: '500',
  transition: 'all 0.2s',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#d0d0d0',
  },
});

export const errorMessage = style({
  display: 'block',
  marginTop: '0.25rem',
  fontSize: '0.75rem',
  color: '#d32f2f',
});

export const mutationErrorContainer = style({
  padding: '1rem',
  backgroundColor: '#ffebee',
  color: '#c62828',
  borderRadius: '4px',
  marginTop: '1rem',
});
