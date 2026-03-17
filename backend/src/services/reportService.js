const PDFDocument = require('pdfkit');
const { createObjectCsvStringifier } = require('csv-writer');
const Transaction = require('../models/Transaction');
const { ApiError } = require('../utils/apiError');

const getReportData = async (companyId, startDate, endDate) => {
  if (!companyId) {
    throw new ApiError(400, 'Company ID is required');
  }

  const match = { company: companyId, status: 'completed' };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(match)
    .populate('fromAccount', 'accountNumber accountName')
    .populate('toAccount', 'accountNumber accountName')
    .populate('initiatedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  return transactions;
};

const exportCSV = async (companyId, startDate, endDate) => {
  const transactions = await getReportData(companyId, startDate, endDate);

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'transactionId', title: 'Transaction ID' },
      { id: 'date', title: 'Date' },
      { id: 'type', title: 'Type' },
      { id: 'amount', title: 'Amount' },
      { id: 'currency', title: 'Currency' },
      { id: 'category', title: 'Category' },
      { id: 'status', title: 'Status' },
      { id: 'from', title: 'From Account' },
      { id: 'to', title: 'To Account' },
      { id: 'description', title: 'Description' },
      { id: 'initiatedBy', title: 'Initiated By' },
    ],
  });

  const records = transactions.map((t) => ({
    transactionId: t.transactionId,
    date: t.createdAt.toISOString().split('T')[0],
    type: t.type,
    amount: t.amount.toFixed(2),
    currency: t.currency,
    category: t.category,
    status: t.status,
    from: t.fromAccount ? `${t.fromAccount.accountName} (${t.fromAccount.accountNumber})` : 'N/A',
    to: t.toAccount ? `${t.toAccount.accountName} (${t.toAccount.accountNumber})` : 'N/A',
    description: t.description || '',
    initiatedBy: t.initiatedBy ? `${t.initiatedBy.firstName} ${t.initiatedBy.lastName}` : 'N/A',
  }));

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};

const exportPDF = async (companyId, startDate, endDate) => {
  const transactions = await getReportData(companyId, startDate, endDate);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Cashflow Report', { align: 'center' });
    doc.moveDown(0.5);

    const dateRange = [];
    if (startDate) dateRange.push(`From: ${new Date(startDate).toLocaleDateString()}`);
    if (endDate) dateRange.push(`To: ${new Date(endDate).toLocaleDateString()}`);
    if (dateRange.length) {
      doc.fontSize(10).text(dateRange.join('  |  '), { align: 'center' });
    }

    doc.moveDown();
    doc.fontSize(10).text(`Total Transactions: ${transactions.length}`, { align: 'left' });
    doc.moveDown();

    const totalCredit = transactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const totalTransfer = transactions.filter((t) => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0);

    doc.text(`Total Cash In (Credit): $${totalCredit.toFixed(2)}`);
    doc.text(`Total Cash Out (Debit): $${totalDebit.toFixed(2)}`);
    doc.text(`Total Transfers: $${totalTransfer.toFixed(2)}`);
    doc.text(`Net Cashflow: $${(totalCredit - totalDebit).toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(9).font('Helvetica-Bold');
    const headers = ['Date', 'ID', 'Type', 'Amount', 'Category', 'Status', 'Description'];
    const colWidths = [70, 90, 55, 70, 80, 60, 200];
    let xPos = 40;

    headers.forEach((header, i) => {
      doc.text(header, xPos, doc.y, { width: colWidths[i], continued: i < headers.length - 1 });
      xPos += colWidths[i];
    });

    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(8);

    const maxRows = Math.min(transactions.length, 50);
    for (let i = 0; i < maxRows; i++) {
      const t = transactions[i];
      if (doc.y > 540) {
        doc.addPage();
      }

      xPos = 40;
      const rowY = doc.y;
      const rowData = [
        t.createdAt.toISOString().split('T')[0],
        t.transactionId.substring(0, 15),
        t.type,
        `$${t.amount.toFixed(2)}`,
        t.category,
        t.status,
        (t.description || '').substring(0, 40),
      ];

      rowData.forEach((cell, j) => {
        doc.text(cell, xPos, rowY, { width: colWidths[j] });
        xPos += colWidths[j];
      });

      doc.moveDown(0.3);
    }

    if (transactions.length > maxRows) {
      doc.moveDown();
      doc.text(`... and ${transactions.length - maxRows} more transactions`);
    }

    doc.end();
  });
};

module.exports = { exportCSV, exportPDF };
