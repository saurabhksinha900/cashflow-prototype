const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post(
  '/transfer',
  authorize('Admin', 'Manager'),
  transactionController.transferValidation,
  validate,
  transactionController.initiateTransfer
);

module.exports = router;
