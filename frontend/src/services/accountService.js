import api from './api';

const accountService = {
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data.data;
  },

  getAccountById: async (id) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data.data;
  },

  getAccountBalance: async (id) => {
    const response = await api.get(`/accounts/${id}/balance`);
    return response.data.data;
  },

  getCompanySummary: async () => {
    const response = await api.get('/accounts/summary');
    return response.data.data;
  },
};

export default accountService;
