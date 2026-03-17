const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', accountController.getAccounts);
router.get('/summary', authorize('Admin', 'Manager'), accountController.getCompanySummary);
router.get('/:id', accountController.getAccountById);
router.get('/:id/balance', accountController.getAccountBalance);

module.exports = router;
