const { body } = require('express-validator');
const transactionService = require('../services/transactionService');

const transferValidation = [
  body('fromAccountId').notEmpty().withMessage('Source account is required').isMongoId().withMessage('Invalid source account ID'),
  body('toAccountId').notEmpty().withMessage('Destination account is required').isMongoId().withMessage('Invalid destination account ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01'),
  body('description').optional().trim().isLength({ max: 250 }).withMessage('Description cannot exceed 250 characters'),
  body('category').optional().isIn([
    'Payroll', 'Vendor Payment', 'Client Receipt', 'Loan Payment',
    'Tax Payment', 'Utilities', 'Rent', 'Insurance', 'Investment', 'Refund', 'Other',
  ]).withMessage('Invalid category'),
];

const getTransactions = async (req, res, next) => {
  try {
    const filters = {
      ...req.query,
      company: req.user.company,
    };
    const result = await transactionService.getTransactions(filters);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    res.status(200).json({ data: transaction });
  } catch (error) {
    next(error);
  }
};

const initiateTransfer = async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount, description, category } = req.body;
    const transaction = await transactionService.initiateTransfer({
      fromAccountId,
      toAccountId,
      amount: Number(amount),
      description,
      category,
      initiatedBy: req.user._id,
      company: req.user.company,
    });

    res.status(201).json({
      message: 'Transfer initiated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, getTransactionById, initiateTransfer, transferValidation };
