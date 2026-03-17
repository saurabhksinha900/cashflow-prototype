const accountService = require('../services/accountService');

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getAccounts(req.user._id, req.user.company);
    res.status(200).json({ data: accounts });
  } catch (error) {
    next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const account = await accountService.getAccountById(req.params.id, req.user._id);
    res.status(200).json({ data: account });
  } catch (error) {
    next(error);
  }
};

const getAccountBalance = async (req, res, next) => {
  try {
    const balance = await accountService.getAccountBalance(req.params.id, req.user._id);
    res.status(200).json({ data: balance });
  } catch (error) {
    next(error);
  }
};

const getCompanySummary = async (req, res, next) => {
  try {
    const summary = await accountService.getCompanyCashflowSummary(req.user.company);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAccounts, getAccountById, getAccountBalance, getCompanySummary };
