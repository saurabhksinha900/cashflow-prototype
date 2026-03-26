import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Pagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import TransactionTable from '../components/dashboard/TransactionTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import transactionService from '../services/transactionService';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '', status: '', category: '', startDate: '', endDate: '', page: 1,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const result = await transactionService.getTransactions(params);
      setTransactions(result?.transactions || []);
      setPagination(result?.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handlePageChange = (_, page) => {
    setFilters({ ...filters, page });
  };

  const handleReset = () => {
    setFilters({ type: '', status: '', category: '', startDate: '', endDate: '', page: 1 });
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Transactions</Typography>

      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField select fullWidth size="small" label="Type" name="type" value={filters.type} onChange={handleFilterChange}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="debit">Debit</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select fullWidth size="small" label="Status" name="status" value={filters.status} onChange={handleFilterChange}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select fullWidth size="small" label="Category" name="category" value={filters.category} onChange={handleFilterChange}>
              <MenuItem value="">All</MenuItem>
              {['Payroll', 'Vendor Payment', 'Client Receipt', 'Loan Payment', 'Tax Payment', 'Utilities', 'Rent', 'Insurance', 'Investment', 'Refund', 'Other'].map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth size="small" label="Start Date" name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth size="small" label="End Date" name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={fetchTransactions} size="small">Filter</Button>
              <Button variant="outlined" onClick={handleReset} size="small">Reset</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {transactions.length} of {pagination.total} transactions
      </Typography>

      {loading ? (
        <LoadingSpinner message="Loading transactions..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchTransactions} />
      ) : (
        <>
          <TransactionTable transactions={transactions} />
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={pagination.totalPages} page={pagination.page} onChange={handlePageChange} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TransactionsPage;
