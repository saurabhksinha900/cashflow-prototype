import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

const ErrorAlert = ({ title = 'Error', message = 'Something went wrong', onRetry }) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity="error" action={onRetry && (
        <Box component="button" onClick={onRetry} sx={{ cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline', color: 'inherit' }}>
          Retry
        </Box>
      )}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;
