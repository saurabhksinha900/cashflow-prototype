const express = require('express');
const router = express.Router();
const {
  exportTransactionsCSV,
  exportTransactionsPDF,
  getReportSummary,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/reports/csv:
 *   get:
 *     summary: Export transactions as CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days to include (default 30)
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/csv', exportTransactionsCSV);

/**
 * @swagger
 * /api/reports/pdf:
 *   get:
 *     summary: Export cashflow report as PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days to include (default 30)
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/pdf', exportTransactionsPDF);

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get report summary data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report summary
 */
router.get('/summary', getReportSummary);

module.exports = router;
