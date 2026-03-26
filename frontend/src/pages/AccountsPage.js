import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import AccountCard from '../components/dashboard/AccountCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import accountService from '../services/accountService';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) return <LoadingSpinner message="Loading accounts..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchAccounts} />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Accounts</Typography>
      {accounts.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No accounts found
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account._id}>
              <AccountCard account={account} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AccountsPage;
