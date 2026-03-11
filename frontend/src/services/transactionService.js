import api from './api';

const transactionService = {
  getTransactions: (params = {}) => api.get('/transactions', { params }),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  getCashflowSummary: (days = 30) => api.get('/transactions/summary', { params: { days } }),
  initiateTransfer: (data) => api.post('/transactions/transfer', data),
};

export default transactionService;
