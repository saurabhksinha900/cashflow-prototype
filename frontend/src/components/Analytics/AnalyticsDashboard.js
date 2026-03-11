import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
import analyticsService from '../../services/analyticsService';

const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

const AnalyticsDashboard = () => {
  const [trend, setTrend] = useState([]);
  const [topPayees, setTopPayees] = useState([]);
  const [topRecipients, setTopRecipients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, payeesRes, recipientsRes, catRes] = await Promise.all([
          analyticsService.getCashflowTrend(6),
          analyticsService.getTopPayees({ limit: 10, days: 90 }),
          analyticsService.getTopRecipients({ limit: 10, days: 90 }),
          analyticsService.getCategoryBreakdown(30),
        ]);
        setTrend(trendRes.data.data);
        setTopPayees(payeesRes.data.data);
        setTopRecipients(recipientsRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;

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
        Cashflow Analytics
      </Typography>

      {/* Trend Chart */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Cash-In vs Cash-Out Trend</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="cashIn" stackId="1" stroke="#2e7d32" fill="#a5d6a7" name="Cash In" />
              <Area type="monotone" dataKey="cashOut" stackId="2" stroke="#dc004e" fill="#ef9a9a" name="Cash Out" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Net Cashflow */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Net Cashflow by Month</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="net" name="Net Cashflow" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Spending by Category</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Payees */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Payees (90 days)</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Payee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Transactions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPayees.map((payee, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{payee.payee}</TableCell>
                        <TableCell align="right">{formatCurrency(payee.totalAmount)}</TableCell>
                        <TableCell align="right">{payee.transactionCount}</TableCell>
                      </TableRow>
                    ))}
                    {topPayees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Recipients */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Recipients (90 days)</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Recipient</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Transactions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topRecipients.map((rec, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{rec.recipient}</TableCell>
                        <TableCell align="right">{formatCurrency(rec.totalAmount)}</TableCell>
                        <TableCell align="right">{rec.transactionCount}</TableCell>
                      </TableRow>
                    ))}
                    {topRecipients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
