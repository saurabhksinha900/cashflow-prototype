const Transaction = require('../models/Transaction');
const { ApiError } = require('../utils/apiError');

const getCashflowSummary = async (companyId, startDate, endDate) => {
  const matchStage = { company: companyId, status: 'completed' };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { cashIn: 0, cashOut: 0, netCashflow: 0, creditCount: 0, debitCount: 0, transferCount: 0 };

  result.forEach((item) => {
    if (item._id === 'credit') {
      summary.cashIn = item.totalAmount;
      summary.creditCount = item.count;
    } else if (item._id === 'debit') {
      summary.cashOut = item.totalAmount;
      summary.debitCount = item.count;
    } else if (item._id === 'transfer') {
      summary.transferCount = item.count;
    }
  });

  summary.netCashflow = summary.cashIn - summary.cashOut;

  return summary;
};

const getCashflowTrends = async (companyId, period = 'monthly', months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  let groupBy;
  if (period === 'daily') {
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
  } else if (period === 'weekly') {
    groupBy = {
      year: { $year: '$createdAt' },
      week: { $week: '$createdAt' },
    };
  } else {
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
    };
  }

  const result = await Transaction.aggregate([
    {
      $match: {
        company: companyId,
        status: 'completed',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          period: groupBy,
          type: '$type',
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.period.year': 1, '_id.period.month': 1, '_id.period.day': 1 } },
  ]);

  const trendMap = {};

  result.forEach((item) => {
    const periodKey = period === 'daily'
      ? `${item._id.period.year}-${String(item._id.period.month).padStart(2, '0')}-${String(item._id.period.day).padStart(2, '0')}`
      : period === 'weekly'
        ? `${item._id.period.year}-W${String(item._id.period.week).padStart(2, '0')}`
        : `${item._id.period.year}-${String(item._id.period.month).padStart(2, '0')}`;

    if (!trendMap[periodKey]) {
      trendMap[periodKey] = { period: periodKey, cashIn: 0, cashOut: 0, netCashflow: 0, transactionCount: 0 };
    }

    if (item._id.type === 'credit') {
      trendMap[periodKey].cashIn = item.totalAmount;
    } else if (item._id.type === 'debit') {
      trendMap[periodKey].cashOut = item.totalAmount;
    }

    trendMap[periodKey].transactionCount += item.count;
    trendMap[periodKey].netCashflow = trendMap[periodKey].cashIn - trendMap[periodKey].cashOut;
  });

  return Object.values(trendMap).sort((a, b) => a.period.localeCompare(b.period));
};

const getTopPayees = async (companyId, limit = 10) => {
  if (!companyId) {
    throw new ApiError(400, 'Company ID is required');
  }

  const result = await Transaction.aggregate([
    {
      $match: {
        company: companyId,
        type: 'debit',
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$toAccount',
        totalPaid: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        lastTransaction: { $max: '$createdAt' },
      },
    },
    { $sort: { totalPaid: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'accounts',
        localField: '_id',
        foreignField: '_id',
        as: 'accountInfo',
      },
    },
    { $unwind: { path: '$accountInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        accountId: '$_id',
        accountName: { $ifNull: ['$accountInfo.accountName', 'Unknown'] },
        accountNumber: { $ifNull: ['$accountInfo.accountNumber', 'N/A'] },
        totalPaid: 1,
        transactionCount: 1,
        lastTransaction: 1,
      },
    },
  ]);

  return result;
};

const getMonthlyReport = async (companyId, year, month) => {
  if (!companyId) {
    throw new ApiError(400, 'Company ID is required');
  }

  const currentDate = new Date();
  const reportYear = year || currentDate.getFullYear();
  const reportMonth = month || currentDate.getMonth() + 1;

  const startDate = new Date(reportYear, reportMonth - 1, 1);
  const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);

  const [categoryBreakdown, dailyTotals, summary] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          company: companyId,
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          company: companyId,
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]),
    getCashflowSummary(companyId, startDate.toISOString(), endDate.toISOString()),
  ]);

  return {
    year: reportYear,
    month: reportMonth,
    summary,
    categoryBreakdown,
    dailyTotals,
  };
};

module.exports = { getCashflowSummary, getCashflowTrends, getTopPayees, getMonthlyReport };
