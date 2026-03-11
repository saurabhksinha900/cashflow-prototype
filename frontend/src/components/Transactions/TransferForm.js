import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Alert,
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
  Grid, Divider,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import accountService from '../../services/accountService';
import transactionService from '../../services/transactionService';

const TransferForm = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    category: 'Transfer',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await accountService.getAccounts({ limit: 100 });
        setAccounts(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load accounts');
      } finally {
        setFetchingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.fromAccountId === formData.toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const res = await transactionService.initiateTransfer({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setSuccess(`Transfer of $${parseFloat(formData.amount).toLocaleString()} completed successfully! Transaction ID: ${res.data.data.transactionId}`);
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
        category: 'Transfer',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;

  const selectedFromAccount = accounts.find((a) => a._id === formData.fromAccountId);

  if (fetchingAccounts) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Fund Transfer
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transfer Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>From Account</InputLabel>
                      <Select
                        name="fromAccountId"
                        value={formData.fromAccountId}
                        onChange={handleChange}
                        label="From Account"
                      >
                        {accounts.map((acc) => (
                          <MenuItem key={acc._id} value={acc._id}>
                            {acc.accountName} ({formatCurrency(acc.availableBalance)})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>To Account</InputLabel>
                      <Select
                        name="toAccountId"
                        value={formData.toAccountId}
                        onChange={handleChange}
                        label="To Account"
                      >
                        {accounts.map((acc) => (
                          <MenuItem key={acc._id} value={acc._id}>
                            {acc.accountName} ({acc.accountNumber})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Amount (USD)"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      inputProps={{ min: 0.01, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                      >
                        <MenuItem value="Transfer">Transfer</MenuItem>
                        <MenuItem value="Payroll">Payroll</MenuItem>
                        <MenuItem value="Vendor Payment">Vendor Payment</MenuItem>
                        <MenuItem value="Loan">Loan</MenuItem>
                        <MenuItem value="Tax">Tax</MenuItem>
                        <MenuItem value="Utility">Utility</MenuItem>
                        <MenuItem value="Investment">Investment</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                      disabled={loading}
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Processing...' : 'Submit Transfer'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {selectedFromAccount && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Source Account
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">Account</Typography>
                <Typography variant="body1" gutterBottom>{selectedFromAccount.accountName}</Typography>
                <Typography variant="body2" color="textSecondary">Number</Typography>
                <Typography variant="body1" gutterBottom>{selectedFromAccount.accountNumber}</Typography>
                <Typography variant="body2" color="textSecondary">Available Balance</Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatCurrency(selectedFromAccount.availableBalance)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransferForm;
