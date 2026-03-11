import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import accountService from '../../services/accountService';

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (typeFilter) params.accountType = typeFilter;

        const [accountsRes, summaryRes] = await Promise.all([
          accountService.getAccounts(params),
          accountService.getCompanySummary(),
        ]);
        setAccounts(accountsRes.data.data);
        setSummary(summaryRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [typeFilter]);

  const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;

  const getTypeColor = (type) => {
    const colors = { Checking: 'primary', Savings: 'success', Business: 'warning', Treasury: 'info' };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Accounts
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceWallet color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Accounts</Typography>
                  <Typography variant="h5" fontWeight="bold">{summary.totalAccounts}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Total Balance</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {formatCurrency(summary.totalBalance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Available Balance</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(summary.totalAvailableBalance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Account Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Account Type"
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Checking">Checking</MenuItem>
            <MenuItem value="Savings">Savings</MenuItem>
            <MenuItem value="Business">Business</MenuItem>
            <MenuItem value="Treasury">Treasury</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Accounts Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account Number</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Currency</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Balance</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Available</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Owner</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account._id} hover>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>
                  <Chip label={account.accountType} color={getTypeColor(account.accountType)} size="small" />
                </TableCell>
                <TableCell>{account.currency}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(account.balance)}
                </TableCell>
                <TableCell align="right">{formatCurrency(account.availableBalance)}</TableCell>
                <TableCell>
                  {account.owner ? `${account.owner.firstName} ${account.owner.lastName}` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No accounts found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AccountList;
