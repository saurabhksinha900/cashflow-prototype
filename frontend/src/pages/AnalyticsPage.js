import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, ButtonGroup } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import CashflowChart from '../components/analytics/CashflowChart';
import NetCashflowChart from '../components/analytics/NetCashflowChart';
import TopPayeesChart from '../components/analytics/TopPayeesChart';
import SummaryCards from '../components/dashboard/SummaryCards';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import analyticsService from '../services/analyticsService';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [trends, setTrends] = useState([]);
  const [topPayees, setTopPayees] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cashSummary, cashTrends, payees] = await Promise.all([
        analyticsService.getCashflowSummary(),
        analyticsService.getCashflowTrends({ period, months: 12 }),
        analyticsService.getTopPayees(10),
      ]);
      setSummary(cashSummary || {});
      setTrends(cashTrends || []);
      setTopPayees(payees || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await analyticsService.exportCSV();
      saveAs(blob, 'cashflow_report.csv');
    } catch (err) {
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await analyticsService.exportPDF();
      saveAs(blob, 'cashflow_report.pdf');
    } catch (err) {
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchAnalytics} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ButtonGroup size="small">
            <Button variant={period === 'daily' ? 'contained' : 'outlined'} onClick={() => setPeriod('daily')}>Daily</Button>
            <Button variant={period === 'weekly' ? 'contained' : 'outlined'} onClick={() => setPeriod('weekly')}>Weekly</Button>
            <Button variant={period === 'monthly' ? 'contained' : 'outlined'} onClick={() => setPeriod('monthly')}>Monthly</Button>
          </ButtonGroup>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV} disabled={exporting} size="small">CSV</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportPDF} disabled={exporting} size="small">PDF</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <SummaryCards summary={summary} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <CashflowChart data={trends} title="Cash In vs Cash Out" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <NetCashflowChart data={trends} title="Net Cashflow Over Time" />
        </Grid>
        <Grid item xs={12} md={5}>
          <TopPayeesChart data={topPayees} title="Top Payees" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
