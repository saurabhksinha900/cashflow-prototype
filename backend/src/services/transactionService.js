const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { ApiError } = require('../utils/apiError');

const getTransactions = async (filters = {}) => {
  const query = {};

  if (filters.company) query.company = filters.company;
  if (filters.fromAccount) query.fromAccount = filters.fromAccount;
  if (filters.toAccount) query.toAccount = filters.toAccount;
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) query.amount.$gte = Number(filters.minAmount);
    if (filters.maxAmount) query.amount.$lte = Number(filters.maxAmount);
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate('fromAccount', 'accountNumber accountName')
      .populate('toAccount', 'accountNumber accountName')
      .populate('initiatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTransactionById = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId)
    .populate('fromAccount', 'accountNumber accountName balance')
    .populate('toAccount', 'accountNumber accountName balance')
    .populate('initiatedBy', 'firstName lastName email');

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  return transaction;
};

const initiateTransfer = async ({ fromAccountId, toAccountId, amount, description, category, initiatedBy, company }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromAccount = await Account.findById(fromAccountId).session(session);
    if (!fromAccount) {
      throw new ApiError(404, 'Source account not found');
    }

    const toAccount = await Account.findById(toAccountId).session(session);
    if (!toAccount) {
      throw new ApiError(404, 'Destination account not found');
    }

    if (fromAccountId === toAccountId) {
      throw new ApiError(400, 'Cannot transfer to the same account');
    }

    if (fromAccount.availableBalance < amount) {
      throw new ApiError(400, 'Insufficient funds');
    }

    fromAccount.balance -= amount;
    fromAccount.availableBalance -= amount;
    toAccount.balance += amount;
    toAccount.availableBalance += amount;

    await fromAccount.save({ session });
    await toAccount.save({ session });

    const transaction = await Transaction.create(
      [
        {
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          type: 'transfer',
          amount,
          description: description || `Transfer from ${fromAccount.accountName} to ${toAccount.accountName}`,
          category: category || 'Other',
          status: 'completed',
          fromAccount: fromAccountId,
          toAccount: toAccountId,
          initiatedBy,
          company,
          currency: fromAccount.currency,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = { getTransactions, getTransactionById, initiateTransfer };
