import api from './api';

const reportService = {
  getReportSummary: (days = 30) => api.get('/reports/summary', { params: { days } }),
  downloadCSV: (days = 30) =>
    api.get('/reports/csv', { params: { days }, responseType: 'blob' }),
  downloadPDF: (days = 30) =>
    api.get('/reports/pdf', { params: { days }, responseType: 'blob' }),
};

export default reportService;
