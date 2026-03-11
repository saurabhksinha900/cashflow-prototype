const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const ApiResponse = require('../utils/apiResponse');

const exportTransactionsCSV = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await Transaction.find({
      company: req.user.company,
      status: 'Completed',
      createdAt: { $gte: startDate },
    })
      .populate('fromAccount', 'accountNumber accountName')
      .populate('toAccount', 'accountNumber accountName')
      .populate('initiatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const data = transactions.map((txn) => ({
      'Transaction ID': txn.transactionId,
      'Date': txn.createdAt.toISOString().split('T')[0],
      'Type': txn.type,
      'Amount': txn.amount,
      'Currency': txn.currency,
      'Category': txn.category,
      'Status': txn.status,
      'From Account': txn.fromAccount ? txn.fromAccount.accountName : 'N/A',
      'To Account': txn.toAccount ? txn.toAccount.accountName : 'N/A',
      'Description': txn.description || '',
      'Initiated By': txn.initiatedBy
        ? `${txn.initiatedBy.firstName} ${txn.initiatedBy.lastName}`
        : 'N/A',
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

const exportTransactionsPDF = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [transactions, accounts] = await Promise.all([
      Transaction.find({
        company: req.user.company,
        status: 'Completed',
        createdAt: { $gte: startDate },
      })
        .populate('fromAccount', 'accountNumber accountName')
        .populate('toAccount', 'accountNumber accountName')
        .sort({ createdAt: -1 }),
      Account.find({ company: req.user.company, isActive: true }),
    ]);

    let totalCashIn = 0;
    let totalCashOut = 0;
    transactions.forEach((txn) => {
      if (txn.type === 'Credit') totalCashIn += txn.amount;
      else if (txn.type === 'Debit') totalCashOut += txn.amount;
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cashflow_report_${Date.now()}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Cashflow Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: Last ${days} days`, { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toISOString().split('T')[0]}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Accounts: ${accounts.length}`);
    doc.text(`Total Account Balance: $${accounts.reduce((s, a) => s + a.balance, 0).toLocaleString()}`);
    doc.text(`Total Cash In: $${totalCashIn.toLocaleString()}`);
    doc.text(`Total Cash Out: $${totalCashOut.toLocaleString()}`);
    doc.text(`Net Cashflow: $${(totalCashIn - totalCashOut).toLocaleString()}`);
    doc.text(`Total Transactions: ${transactions.length}`);
    doc.moveDown(2);

    // Transaction List
    doc.fontSize(14).text('Recent Transactions', { underline: true });
    doc.moveDown(0.5);

    const displayTransactions = transactions.slice(0, 50);
    displayTransactions.forEach((txn) => {
      doc.fontSize(9);
      const from = txn.fromAccount ? txn.fromAccount.accountName : 'N/A';
      const to = txn.toAccount ? txn.toAccount.accountName : 'N/A';
      doc.text(
        `${txn.createdAt.toISOString().split('T')[0]} | ${txn.transactionId} | ${txn.type} | $${txn.amount.toLocaleString()} | ${from} -> ${to} | ${txn.status}`
      );
    });

    if (transactions.length > 50) {
      doc.moveDown();
      doc.text(`... and ${transactions.length - 50} more transactions`);
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

const getReportSummary = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await Transaction.find({
      company: req.user.company,
      status: 'Completed',
      createdAt: { $gte: startDate },
    });

    let totalCashIn = 0;
    let totalCashOut = 0;
    const categoryTotals = {};

    transactions.forEach((txn) => {
      if (txn.type === 'Credit') totalCashIn += txn.amount;
      else if (txn.type === 'Debit') totalCashOut += txn.amount;

      if (!categoryTotals[txn.category]) {
        categoryTotals[txn.category] = { amount: 0, count: 0 };
      }
      categoryTotals[txn.category].amount += txn.amount;
      categoryTotals[txn.category].count++;
    });

    return ApiResponse.success(res, {
      period: `Last ${days} days`,
      totalCashIn,
      totalCashOut,
      netCashflow: totalCashIn - totalCashOut,
      transactionCount: transactions.length,
      categoryBreakdown: categoryTotals,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportTransactionsCSV,
  exportTransactionsPDF,
  getReportSummary,
};
