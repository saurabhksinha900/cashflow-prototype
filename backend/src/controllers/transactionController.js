const { body, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const ApiResponse = require('../utils/apiResponse');

const transferValidation = [
  body('fromAccountId').notEmpty().withMessage('Source account is required'),
  body('toAccountId').notEmpty().withMessage('Destination account is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ max: 255 }),
  body('category').optional().isIn([
    'Payroll', 'Vendor Payment', 'Client Payment', 'Loan',
    'Tax', 'Utility', 'Investment', 'Transfer', 'Other',
  ]),
];

const getTransactionsValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['Credit', 'Debit', 'Transfer']),
  query('status').optional().isIn(['Pending', 'Completed', 'Failed', 'Cancelled']),
  query('category').optional().isIn([
    'Payroll', 'Vendor Payment', 'Client Payment', 'Loan',
    'Tax', 'Utility', 'Investment', 'Transfer', 'Other',
  ]),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('accountId').optional().isMongoId(),
];

const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { company: req.user.company };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    if (req.query.accountId) {
      filter.$or = [
        { fromAccount: req.query.accountId },
        { toAccount: req.query.accountId },
      ];
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('fromAccount', 'accountNumber accountName')
        .populate('toAccount', 'accountNumber accountName')
        .populate('initiatedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return ApiResponse.paginated(
      res,
      transactions,
      { page, limit, total, pages: Math.ceil(total / limit) },
      'Transactions retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      company: req.user.company,
    })
      .populate('fromAccount', 'accountNumber accountName accountType')
      .populate('toAccount', 'accountNumber accountName accountType')
      .populate('initiatedBy', 'firstName lastName email');

    if (!transaction) {
      return ApiResponse.error(res, 'Transaction not found', 404);
    }

    return ApiResponse.success(res, transaction);
  } catch (error) {
    next(error);
  }
};

const initiateTransfer = async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount, description, category } = req.body;

    if (fromAccountId === toAccountId) {
      return ApiResponse.error(res, 'Source and destination accounts must be different', 400);
    }

    const [fromAccount, toAccount] = await Promise.all([
      Account.findOne({ _id: fromAccountId, company: req.user.company, isActive: true }),
      Account.findOne({ _id: toAccountId, isActive: true }),
    ]);

    if (!fromAccount) {
      return ApiResponse.error(res, 'Source account not found or inactive', 404);
    }

    if (!toAccount) {
      return ApiResponse.error(res, 'Destination account not found or inactive', 404);
    }

    if (fromAccount.availableBalance < amount) {
      return ApiResponse.error(res, 'Insufficient funds', 400);
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Update balances
    fromAccount.balance -= amount;
    fromAccount.availableBalance -= amount;
    toAccount.balance += amount;
    toAccount.availableBalance += amount;

    await Promise.all([fromAccount.save(), toAccount.save()]);

    const transaction = await Transaction.create({
      transactionId,
      type: 'Transfer',
      amount,
      description: description || `Transfer from ${fromAccount.accountName} to ${toAccount.accountName}`,
      category: category || 'Transfer',
      status: 'Completed',
      fromAccount: fromAccountId,
      toAccount: toAccountId,
      company: req.user.company,
      initiatedBy: req.user.id,
      completedAt: new Date(),
      metadata: {
        payee: toAccount.accountName,
        payeeAccount: toAccount.accountNumber,
      },
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('fromAccount', 'accountNumber accountName')
      .populate('toAccount', 'accountNumber accountName');

    return ApiResponse.created(res, populatedTransaction, 'Transfer completed successfully');
  } catch (error) {
    next(error);
  }
};

const getCashflowSummary = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await Transaction.find({
      company: req.user.company,
      status: 'Completed',
      createdAt: { $gte: startDate },
    });

    let totalCashIn = 0;
    let totalCashOut = 0;

    transactions.forEach((txn) => {
      if (txn.type === 'Credit') {
        totalCashIn += txn.amount;
      } else if (txn.type === 'Debit') {
        totalCashOut += txn.amount;
      }
    });

    const summary = {
      period: `Last ${days} days`,
      totalCashIn,
      totalCashOut,
      netCashflow: totalCashIn - totalCashOut,
      transactionCount: transactions.length,
      averageTransaction: transactions.length > 0
        ? (totalCashIn + totalCashOut) / transactions.length
        : 0,
    };

    return ApiResponse.success(res, summary, 'Cashflow summary retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  initiateTransfer,
  getCashflowSummary,
  transferValidation,
  getTransactionsValidation,
};
