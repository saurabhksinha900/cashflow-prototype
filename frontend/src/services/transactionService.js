import api from './api';

const transactionService = {
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data.data;
  },

  getTransactionById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data;
  },

  initiateTransfer: async (transferData) => {
    const response = await api.post('/transactions/transfer', transferData);
    return response.data.data;
  },
};

export default transactionService;
