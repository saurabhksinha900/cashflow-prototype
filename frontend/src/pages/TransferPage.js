import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, MenuItem,
  Alert, Grid, Divider,
} from '@mui/material';
import { SwapHoriz as TransferIcon } from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';

const TransferPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fromAccountId: '', toAccountId: '', amount: '', description: '', category: 'Other',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data || []);
      } catch (err) {
        setError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.fromAccountId) errors.fromAccountId = 'Source account is required';
    if (!formData.toAccountId) errors.toAccountId = 'Destination account is required';
    if (formData.fromAccountId === formData.toAccountId) errors.toAccountId = 'Cannot transfer to the same account';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Amount must be greater than 0';

    const sourceAccount = accounts.find((a) => a._id === formData.fromAccountId);
    if (sourceAccount && parseFloat(formData.amount) > sourceAccount.availableBalance) {
      errors.amount = 'Insufficient funds';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await transactionService.initiateTransfer({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setSuccess('Transfer completed successfully!');
      setFormData({ fromAccountId: '', toAccountId: '', amount: '', description: '', category: 'Other' });
      const updatedAccounts = await accountService.getAccounts();
      setAccounts(updatedAccounts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) return <LoadingSpinner message="Loading accounts..." />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Fund Transfer</Typography>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TransferIcon color="primary" />
            <Typography variant="h6">Initiate Transfer</Typography>
          </Box>

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              select fullWidth label="From Account" name="fromAccountId"
              value={formData.fromAccountId} onChange={handleChange} margin="normal"
              error={!!formErrors.fromAccountId} helperText={formErrors.fromAccountId}
            >
              {accounts.map((acct) => (
                <MenuItem key={acct._id} value={acct._id}>
                  {acct.accountName} ({acct.accountNumber}) - {formatCurrency(acct.availableBalance)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select fullWidth label="To Account" name="toAccountId"
              value={formData.toAccountId} onChange={handleChange} margin="normal"
              error={!!formErrors.toAccountId} helperText={formErrors.toAccountId}
            >
              {accounts.map((acct) => (
                <MenuItem key={acct._id} value={acct._id}>
                  {acct.accountName} ({acct.accountNumber})
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth label="Amount" name="amount" type="number"
                  value={formData.amount} onChange={handleChange} margin="normal"
                  inputProps={{ min: 0.01, step: 0.01 }}
                  error={!!formErrors.amount} helperText={formErrors.amount}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select fullWidth label="Category" name="category"
                  value={formData.category} onChange={handleChange} margin="normal"
                >
                  {['Payroll', 'Vendor Payment', 'Client Receipt', 'Loan Payment', 'Tax Payment', 'Utilities', 'Rent', 'Insurance', 'Investment', 'Refund', 'Other'].map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              fullWidth multiline rows={2} label="Description (optional)" name="description"
              value={formData.description} onChange={handleChange} margin="normal"
              inputProps={{ maxLength: 250 }}
            />

            <Divider sx={{ my: 2 }} />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting} startIcon={<TransferIcon />}>
              {submitting ? 'Processing...' : 'Transfer Funds'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransferPage;
