import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { AccountBalance as AccountIcon } from '@mui/icons-material';

const AccountCard = ({ account }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <Card sx={{ height: '100%', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>{account.accountName}</Typography>
          </Box>
          <Chip label={account.accountType} size="small" color="primary" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {account.accountNumber}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">Balance</Typography>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {formatCurrency(account.balance, account.currency)}
          </Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">Available</Typography>
          <Typography variant="h6" color="text.primary">
            {formatCurrency(account.availableBalance, account.currency)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
