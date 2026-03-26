const Account = require('../models/Account');
const { ApiError } = require('../utils/apiError');

const getAccounts = async (userId, companyId) => {
  const filter = { owner: userId, isActive: true };
  if (companyId) filter.company = companyId;
  return Account.find(filter)
    .populate('company', 'name')
    .sort({ createdAt: -1 });
};

const getAccountById = async (accountId, userId) => {
  const account = await Account.findOne({ _id: accountId, owner: userId, isActive: true })
    .populate('company', 'name')
    .populate('owner', 'firstName lastName email');

  if (!account) {
    throw new ApiError(404, 'Account not found');
  }
  return account;
};

const getAccountBalance = async (accountId, userId) => {
  const account = await Account.findOne(
    { _id: accountId, owner: userId, isActive: true },
    'accountNumber accountName balance availableBalance currency'
  );

  if (!account) {
    throw new ApiError(404, 'Account not found');
  }

  return {
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    balance: account.balance,
    availableBalance: account.availableBalance,
    currency: account.currency,
  };
};

const getCompanyCashflowSummary = async (companyId) => {
  const accounts = await Account.find({ company: companyId, isActive: true });

  const summary = accounts.reduce(
    (acc, account) => {
      acc.totalBalance += account.balance;
      acc.totalAvailableBalance += account.availableBalance;
      acc.accountCount += 1;
      return acc;
    },
    { totalBalance: 0, totalAvailableBalance: 0, accountCount: 0 }
  );

  return {
    companyId,
    ...summary,
    currency: 'USD',
  };
};

module.exports = { getAccounts, getAccountById, getAccountBalance, getCompanyCashflowSummary };
