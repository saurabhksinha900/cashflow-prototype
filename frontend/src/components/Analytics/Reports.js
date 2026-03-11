import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, CircularProgress,
  Alert, FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material';
import { Download, PictureAsPdf, TableChart } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import reportService from '../../services/reportService';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await reportService.getReportSummary(days);
        setSummary(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [days]);

  const handleDownloadCSV = async () => {
    setDownloading('csv');
    try {
      const res = await reportService.downloadCSV(days);
      saveAs(new Blob([res.data]), `transactions_report_${Date.now()}.csv`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download CSV');
    } finally {
      setDownloading('');
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading('pdf');
    try {
      const res = await reportService.downloadPDF(days);
      saveAs(new Blob([res.data], { type: 'application/pdf' }), `cashflow_report_${Date.now()}.pdf`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloading('');
    }
  };

  const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Reports
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Period Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Report Period</InputLabel>
          <Select value={days} onChange={(e) => setDays(e.target.value)} label="Report Period">
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={60}>Last 60 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
            <MenuItem value={180}>Last 180 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Total Cash In</Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {formatCurrency(summary.totalCashIn)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Total Cash Out</Typography>
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  {formatCurrency(summary.totalCashOut)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Net Cashflow</Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatCurrency(summary.netCashflow)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Transactions</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {summary.transactionCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Category Breakdown */}
      {summary?.categoryBreakdown && (
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Object.entries(summary.categoryBreakdown).map(([category, data]) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary">{category}</Typography>
                    <Typography variant="h6" fontWeight="bold">{formatCurrency(data.amount)}</Typography>
                    <Typography variant="body2">{data.count} transactions</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Download Section */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Reports
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <TableChart sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>CSV Report</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Export all transactions as a CSV spreadsheet
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={downloading === 'csv' ? <CircularProgress size={20} /> : <Download />}
                  onClick={handleDownloadCSV}
                  disabled={!!downloading}
                >
                  {downloading === 'csv' ? 'Downloading...' : 'Download CSV'}
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <PictureAsPdf sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>PDF Report</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Generate a comprehensive cashflow PDF report
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={downloading === 'pdf' ? <CircularProgress size={20} /> : <Download />}
                  onClick={handleDownloadPDF}
                  disabled={!!downloading}
                >
                  {downloading === 'pdf' ? 'Downloading...' : 'Download PDF'}
                </Button>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
