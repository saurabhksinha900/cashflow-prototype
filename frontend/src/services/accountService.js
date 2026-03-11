import api from './api';

const accountService = {
  getAccounts: (params = {}) => api.get('/accounts', { params }),
  getAccountById: (id) => api.get(`/accounts/${id}`),
  getAccountBalance: (id) => api.get(`/accounts/${id}/balance`),
  getCompanySummary: () => api.get('/accounts/summary'),
  createAccount: (data) => api.post('/accounts', data),
};

export default accountService;
