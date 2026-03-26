const reportService = require('../services/reportService');

const exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const csv = await reportService.exportCSV(req.user.company, startDate, endDate);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cashflow_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

const exportPDF = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const pdfBuffer = await reportService.exportPDF(req.user.company, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=cashflow_report.pdf');
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { exportCSV, exportPDF };
