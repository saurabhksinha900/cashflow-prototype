import api from './api';

const analyticsService = {
  getCashflowTrend: (months = 6) => api.get('/analytics/trend', { params: { months } }),
  getTopPayees: (params = {}) => api.get('/analytics/top-payees', { params }),
  getTopRecipients: (params = {}) => api.get('/analytics/top-recipients', { params }),
  getCategoryBreakdown: (days = 30) => api.get('/analytics/categories', { params: { days } }),
  getMonthlyReport: (year, month) => api.get('/analytics/monthly-report', { params: { year, month } }),
};

export default analyticsService;
