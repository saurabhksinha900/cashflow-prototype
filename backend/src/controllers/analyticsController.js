const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const ApiResponse = require('../utils/apiResponse');

const getCashflowTrend = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await Transaction.find({
      company: req.user.company,
      status: 'Completed',
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 1 });

    const monthlyData = {};

    transactions.forEach((txn) => {
      const monthKey = `${txn.createdAt.getFullYear()}-${String(txn.createdAt.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, cashIn: 0, cashOut: 0, net: 0, count: 0 };
      }

      if (txn.type === 'Credit') {
        monthlyData[monthKey].cashIn += txn.amount;
      } else if (txn.type === 'Debit') {
        monthlyData[monthKey].cashOut += txn.amount;
      }
      monthlyData[monthKey].net = monthlyData[monthKey].cashIn - monthlyData[monthKey].cashOut;
      monthlyData[monthKey].count++;
    });

    const trend = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    return ApiResponse.success(res, trend, 'Cashflow trend retrieved');
  } catch (error) {
    next(error);
  }
};

const getTopPayees = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await Transaction.aggregate([
      {
        $match: {
          company: req.user.company._id || req.user.company,
          status: 'Completed',
          type: { $in: ['Debit', 'Transfer'] },
          createdAt: { $gte: startDate },
          'metadata.payee': { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$metadata.payee',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          lastTransaction: { $max: '$createdAt' },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
      {
        $project: {
          payee: '$_id',
          totalAmount: 1,
          transactionCount: 1,
          lastTransaction: 1,
          _id: 0,
        },
      },
    ]);

    return ApiResponse.success(res, results, 'Top payees retrieved');
  } catch (error) {
    next(error);
  }
};

const getTopRecipients = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await Transaction.aggregate([
      {
        $match: {
          company: req.user.company._id || req.user.company,
          status: 'Completed',
          type: 'Credit',
          createdAt: { $gte: startDate },
          'metadata.payee': { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$metadata.payee',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          lastTransaction: { $max: '$createdAt' },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
      {
        $project: {
          recipient: '$_id',
          totalAmount: 1,
          transactionCount: 1,
          lastTransaction: 1,
          _id: 0,
        },
      },
    ]);

    return ApiResponse.success(res, results, 'Top recipients retrieved');
  } catch (error) {
    next(error);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await Transaction.aggregate([
      {
        $match: {
          company: req.user.company._id || req.user.company,
          status: 'Completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      {
        $project: {
          category: '$_id',
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    return ApiResponse.success(res, results, 'Category breakdown retrieved');
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [transactions, accounts] = await Promise.all([
      Transaction.find({
        company: req.user.company,
        status: 'Completed',
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      Account.find({ company: req.user.company, isActive: true }),
    ]);

    let totalCashIn = 0;
    let totalCashOut = 0;
    const dailyData = {};

    transactions.forEach((txn) => {
      const dayKey = txn.createdAt.getDate();

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { day: dayKey, cashIn: 0, cashOut: 0 };
      }

      if (txn.type === 'Credit') {
        totalCashIn += txn.amount;
        dailyData[dayKey].cashIn += txn.amount;
      } else if (txn.type === 'Debit') {
        totalCashOut += txn.amount;
        dailyData[dayKey].cashOut += txn.amount;
      }
    });

    const report = {
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalCashIn,
      totalCashOut,
      netCashflow: totalCashIn - totalCashOut,
      transactionCount: transactions.length,
      totalAccountBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      dailyBreakdown: Object.values(dailyData).sort((a, b) => a.day - b.day),
    };

    return ApiResponse.success(res, report, 'Monthly report retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCashflowTrend,
  getTopPayees,
  getTopRecipients,
  getCategoryBreakdown,
  getMonthlyReport,
};
