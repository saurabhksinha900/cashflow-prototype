const { body, query } = require('express-validator');
const Account = require('../models/Account');
const ApiResponse = require('../utils/apiResponse');

const createAccountValidation = [
  body('accountName').trim().notEmpty().withMessage('Account name is required'),
  body('accountType')
    .isIn(['Checking', 'Savings', 'Business', 'Treasury'])
    .withMessage('Invalid account type'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD']),
  body('balance').optional().isNumeric().withMessage('Balance must be a number'),
];

const getAccountsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('accountType').optional().isIn(['Checking', 'Savings', 'Business', 'Treasury']),
];

const getAccounts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { company: req.user.company, isActive: true };

    if (req.query.accountType) {
      filter.accountType = req.query.accountType;
    }

    const [accounts, total] = await Promise.all([
      Account.find(filter)
        .populate('owner', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Account.countDocuments(filter),
    ]);

    return ApiResponse.paginated(
      res,
      accounts,
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      'Accounts retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      company: req.user.company,
    })
      .populate('owner', 'firstName lastName email')
      .populate('company', 'name');

    if (!account) {
      return ApiResponse.error(res, 'Account not found', 404);
    }

    return ApiResponse.success(res, account);
  } catch (error) {
    next(error);
  }
};

const getAccountBalance = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      company: req.user.company,
    }).select('accountNumber accountName accountType balance availableBalance currency');

    if (!account) {
      return ApiResponse.error(res, 'Account not found', 404);
    }

    return ApiResponse.success(res, account, 'Balance retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { accountName, accountType, currency, balance } = req.body;

    const accountNumber = `ACC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const account = await Account.create({
      accountNumber,
      accountName,
      accountType,
      currency: currency || 'USD',
      balance: balance || 0,
      availableBalance: balance || 0,
      company: req.user.company,
      owner: req.user.id,
    });

    return ApiResponse.created(res, account, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

const getCompanySummary = async (req, res, next) => {
  try {
    const accounts = await Account.find({
      company: req.user.company,
      isActive: true,
    });

    const summary = {
      totalAccounts: accounts.length,
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      totalAvailableBalance: accounts.reduce((sum, acc) => sum + acc.availableBalance, 0),
      byType: {},
    };

    accounts.forEach((acc) => {
      if (!summary.byType[acc.accountType]) {
        summary.byType[acc.accountType] = { count: 0, balance: 0 };
      }
      summary.byType[acc.accountType].count++;
      summary.byType[acc.accountType].balance += acc.balance;
    });

    return ApiResponse.success(res, summary, 'Company summary retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  getAccountBalance,
  createAccount,
  getCompanySummary,
  createAccountValidation,
  getAccountsValidation,
};
