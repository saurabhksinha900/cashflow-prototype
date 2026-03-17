import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  TrendingUp as CashInIcon, TrendingDown as CashOutIcon,
  AccountBalanceWallet as NetIcon, CompareArrows as TransferIcon,
} from '@mui/icons-material';

const SummaryCards = ({ summary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const cards = [
    { title: 'Cash In', value: formatCurrency(summary.cashIn), icon: <CashInIcon />, color: '#388e3c', bg: '#e8f5e9' },
    { title: 'Cash Out', value: formatCurrency(summary.cashOut), icon: <CashOutIcon />, color: '#d32f2f', bg: '#ffebee' },
    { title: 'Net Cashflow', value: formatCurrency(summary.netCashflow), icon: <NetIcon />, color: '#1976d2', bg: '#e3f2fd' },
    { title: 'Transfers', value: summary.transferCount || 0, icon: <TransferIcon />, color: '#f57c00', bg: '#fff3e0' },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>{card.title}</Typography>
                  <Typography variant="h5" fontWeight={700}>{card.value}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: card.bg, color: card.color, display: 'flex' }}>
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
