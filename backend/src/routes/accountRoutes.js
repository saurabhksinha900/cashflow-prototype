const express = require('express');
const router = express.Router();
const {
  getAccounts,
  getAccountById,
  getAccountBalance,
  createAccount,
  getCompanySummary,
  createAccountValidation,
  getAccountsValidation,
} = require('../controllers/accountController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts for the user's company
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [Checking, Savings, Business, Treasury]
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get('/', getAccountsValidation, validate, getAccounts);

/**
 * @swagger
 * /api/accounts/summary:
 *   get:
 *     summary: Get company cashflow summary
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company account summary
 */
router.get('/summary', getCompanySummary);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account details
 *       404:
 *         description: Account not found
 */
router.get('/:id', getAccountById);

/**
 * @swagger
 * /api/accounts/{id}/balance:
 *   get:
 *     summary: Get account balance
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account balance
 */
router.get('/:id/balance', getAccountBalance);

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountName, accountType]
 *             properties:
 *               accountName:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 enum: [Checking, Savings, Business, Treasury]
 *               currency:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Account created
 */
router.post('/', authorize('Admin', 'Manager'), createAccountValidation, validate, createAccount);

module.exports = router;
