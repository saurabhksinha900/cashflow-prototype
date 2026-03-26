const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/cashflow-summary', analyticsController.getCashflowSummary);
router.get('/trends', analyticsController.getCashflowTrends);
router.get('/top-payees', analyticsController.getTopPayees);
router.get('/monthly-report', analyticsController.getMonthlyReport);

module.exports = router;
