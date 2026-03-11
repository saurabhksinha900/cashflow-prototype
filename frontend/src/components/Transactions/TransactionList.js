import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, FormControl, InputLabel, Select, MenuItem, TextField, Grid,
  TablePagination,
} from '@mui/material';
import transactionService from '../../services/transactionService';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params = { page: page + 1, limit: rowsPerPage };
        Object.entries(filters).forEach(([key, val]) => {
          if (val) params[key] = val;
        });
        const res = await transactionService.getTransactions(params);
        setTransactions(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page, rowsPerPage, filters]);

  const handleFilterChange = (field) => (e) => {
    setFilters({ ...filters, [field]: e.target.value });
    setPage(0);
  };

  const getStatusColor = (status) => {
    const colors = { Completed: 'success', Pending: 'warning', Failed: 'error', Cancelled: 'default' };
    return colors[status] || 'default';
  };

  const getTypeColor = (type) => {
    const colors = { Credit: 'success', Debit: 'error', Transfer: 'info' };
    return colors[type] || 'default';
  };

  const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Transactions
      </Typography>

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filters.type} onChange={handleFilterChange('type')} label="Type">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                  <MenuItem value="Debit">Debit</MenuItem>
                  <MenuItem value="Transfer">Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} onChange={handleFilterChange('status')} label="Status">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={filters.category} onChange={handleFilterChange('category')} label="Category">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Payroll">Payroll</MenuItem>
                  <MenuItem value="Vendor Payment">Vendor Payment</MenuItem>
                  <MenuItem value="Client Payment">Client Payment</MenuItem>
                  <MenuItem value="Loan">Loan</MenuItem>
                  <MenuItem value="Tax">Tax</MenuItem>
                  <MenuItem value="Utility">Utility</MenuItem>
                  <MenuItem value="Investment">Investment</MenuItem>
                  <MenuItem value="Transfer">Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange('startDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange('endDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Transactions Table */}
      <TableContainer component={Paper} elevation={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Transaction ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>From</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>To</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn._id} hover>
                    <TableCell>{formatDate(txn.createdAt)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {txn.transactionId}
                    </TableCell>
                    <TableCell>
                      <Chip label={txn.type} color={getTypeColor(txn.type)} size="small" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(txn.amount)}
                    </TableCell>
                    <TableCell>{txn.category}</TableCell>
                    <TableCell>{txn.fromAccount?.accountName || 'N/A'}</TableCell>
                    <TableCell>{txn.toAccount?.accountName || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={txn.status} color={getStatusColor(txn.status)} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No transactions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={pagination.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </TableContainer>
    </Box>
  );
};

export default TransactionList;
