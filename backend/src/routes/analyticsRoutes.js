const express = require('express');
const router = express.Router();
const {
  getCashflowTrend,
  getTopPayees,
  getTopRecipients,
  getCategoryBreakdown,
  getMonthlyReport,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/analytics/trend:
 *   get:
 *     summary: Get cashflow trend data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *         description: Number of months (default 6)
 *     responses:
 *       200:
 *         description: Monthly cashflow trend
 */
router.get('/trend', getCashflowTrend);

/**
 * @swagger
 * /api/analytics/top-payees:
 *   get:
 *     summary: Get top payees
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top payees list
 */
router.get('/top-payees', getTopPayees);

/**
 * @swagger
 * /api/analytics/top-recipients:
 *   get:
 *     summary: Get top recipients
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top recipients list
 */
router.get('/top-recipients', getTopRecipients);

/**
 * @swagger
 * /api/analytics/categories:
 *   get:
 *     summary: Get transaction category breakdown
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get('/categories', getCategoryBreakdown);

/**
 * @swagger
 * /api/analytics/monthly-report:
 *   get:
 *     summary: Get monthly report
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly report data
 */
router.get('/monthly-report', getMonthlyReport);

module.exports = router;
