import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Typography, Box,
} from '@mui/material';

const statusColors = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  cancelled: 'default',
};

const typeColors = {
  credit: '#388e3c',
  debit: '#d32f2f',
  transfer: '#1976d2',
};

const TransactionTable = ({ transactions = [], compact = false }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">No transactions found</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size={compact ? 'small' : 'medium'}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            {!compact && <TableCell><strong>Category</strong></TableCell>}
            <TableCell><strong>Type</strong></TableCell>
            <TableCell align="right"><strong>Amount</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn._id} hover>
              <TableCell>{formatDate(txn.createdAt)}</TableCell>
              <TableCell>
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                  {txn.description || 'N/A'}
                </Typography>
              </TableCell>
              {!compact && <TableCell>{txn.category}</TableCell>}
              <TableCell>
                <Typography variant="body2" sx={{ color: typeColors[txn.type], fontWeight: 600, textTransform: 'capitalize' }}>
                  {txn.type}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600} sx={{ color: txn.type === 'credit' ? '#388e3c' : txn.type === 'debit' ? '#d32f2f' : 'inherit' }}>
                  {txn.type === 'credit' ? '+' : txn.type === 'debit' ? '-' : ''}{formatCurrency(txn.amount, txn.currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={txn.status} size="small" color={statusColors[txn.status] || 'default'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionTable;
