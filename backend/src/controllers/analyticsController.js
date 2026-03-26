const analyticsService = require('../services/analyticsService');

const getCashflowSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await analyticsService.getCashflowSummary(req.user.company, startDate, endDate);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
};

const getCashflowTrends = async (req, res, next) => {
  try {
    const { period, months } = req.query;
    const trends = await analyticsService.getCashflowTrends(
      req.user.company,
      period || 'monthly',
      parseInt(months) || 12
    );
    res.status(200).json({ data: trends });
  } catch (error) {
    next(error);
  }
};

const getTopPayees = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const payees = await analyticsService.getTopPayees(req.user.company, limit);
    res.status(200).json({ data: payees });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const report = await analyticsService.getMonthlyReport(
      req.user.company,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined
    );
    res.status(200).json({ data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCashflowSummary, getCashflowTrends, getTopPayees, getMonthlyReport };
