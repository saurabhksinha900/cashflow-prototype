import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import SummaryCards from '../components/dashboard/SummaryCards';
import AccountCard from '../components/dashboard/AccountCard';
import TransactionTable from '../components/dashboard/TransactionTable';
import CashflowChart from '../components/analytics/CashflowChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import analyticsService from '../services/analyticsService';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [trends, setTrends] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accts, txnResult, cashSummary, cashTrends] = await Promise.all([
        accountService.getAccounts(),
        transactionService.getTransactions({ limit: 10 }),
        analyticsService.getCashflowSummary().catch(() => ({})),
        analyticsService.getCashflowTrends({ period: 'monthly', months: 6 }).catch(() => []),
      ]);
      setAccounts(accts || []);
      setTransactions(txnResult?.transactions || []);
      setSummary(cashSummary || {});
      setTrends(cashTrends || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard</Typography>

      <Box sx={{ mb: 4 }}>
        <SummaryCards summary={summary} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {accounts.slice(0, 4).map((account) => (
          <Grid item xs={12} sm={6} md={3} key={account._id}>
            <AccountCard account={account} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 4 }}>
        <CashflowChart data={trends} title="Cashflow Trends (Last 6 Months)" />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
        <TransactionTable transactions={transactions} compact />
      </Box>
    </Box>
  );
};

export default DashboardPage;
