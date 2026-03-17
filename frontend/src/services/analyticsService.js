import api from './api';

const analyticsService = {
  getCashflowSummary: async (params = {}) => {
    const response = await api.get('/analytics/cashflow-summary', { params });
    return response.data.data;
  },

  getCashflowTrends: async (params = {}) => {
    const response = await api.get('/analytics/trends', { params });
    return response.data.data;
  },

  getTopPayees: async (limit = 10) => {
    const response = await api.get('/analytics/top-payees', { params: { limit } });
    return response.data.data;
  },

  getMonthlyReport: async (year, month) => {
    const response = await api.get('/analytics/monthly-report', { params: { year, month } });
    return response.data.data;
  },

  exportCSV: async (params = {}) => {
    const response = await api.get('/reports/export/csv', { params, responseType: 'blob' });
    return response.data;
  },

  exportPDF: async (params = {}) => {
    const response = await api.get('/reports/export/pdf', { params, responseType: 'blob' });
    return response.data;
  },
};

export default analyticsService;
