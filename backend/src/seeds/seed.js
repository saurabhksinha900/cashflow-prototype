require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const Company = require('../models/Company');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

const seedData = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB for seeding...');

    await Company.deleteMany({});
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data.');

    const companies = await Company.insertMany([
      {
        name: 'Acme Corporation',
        registrationNumber: 'ACME-2024-001',
        industry: 'Technology',
        address: { street: '123 Tech Blvd', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'US' },
        contactEmail: 'info@acmecorp.com',
        contactPhone: '+1-415-555-0100',
      },
      {
        name: 'GlobalTrade Inc',
        registrationNumber: 'GT-2024-002',
        industry: 'Finance',
        address: { street: '456 Wall St', city: 'New York', state: 'NY', zipCode: '10005', country: 'US' },
        contactEmail: 'contact@globaltrade.com',
        contactPhone: '+1-212-555-0200',
      },
    ]);
    console.log(`Created ${companies.length} companies.`);

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Password123', salt);

    const users = await User.insertMany([
      {
        firstName: 'John', lastName: 'Admin', email: 'admin@acmecorp.com',
        password: hashedPassword, role: 'Admin', company: companies[0]._id,
      },
      {
        firstName: 'Jane', lastName: 'Manager', email: 'manager@acmecorp.com',
        password: hashedPassword, role: 'Manager', company: companies[0]._id,
      },
      {
        firstName: 'Bob', lastName: 'Employee', email: 'employee@acmecorp.com',
        password: hashedPassword, role: 'Employee', company: companies[0]._id,
      },
      {
        firstName: 'Alice', lastName: 'Director', email: 'admin@globaltrade.com',
        password: hashedPassword, role: 'Admin', company: companies[1]._id,
      },
    ]);
    console.log(`Created ${users.length} users.`);

    const accounts = await Account.insertMany([
      {
        accountNumber: 'ACC-001-CHK', accountName: 'Acme Operating Account', accountType: 'Checking',
        currency: 'USD', balance: 250000, availableBalance: 245000, owner: users[0]._id, company: companies[0]._id,
      },
      {
        accountNumber: 'ACC-002-SAV', accountName: 'Acme Savings Account', accountType: 'Savings',
        currency: 'USD', balance: 500000, availableBalance: 500000, owner: users[0]._id, company: companies[0]._id,
      },
      {
        accountNumber: 'ACC-003-BIZ', accountName: 'Acme Business Account', accountType: 'Business',
        currency: 'USD', balance: 1000000, availableBalance: 980000, owner: users[1]._id, company: companies[0]._id,
      },
      {
        accountNumber: 'ACC-004-INV', accountName: 'Acme Investment Account', accountType: 'Investment',
        currency: 'USD', balance: 750000, availableBalance: 750000, owner: users[1]._id, company: companies[0]._id,
      },
      {
        accountNumber: 'ACC-005-CHK', accountName: 'GlobalTrade Operating', accountType: 'Checking',
        currency: 'USD', balance: 350000, availableBalance: 340000, owner: users[3]._id, company: companies[1]._id,
      },
      {
        accountNumber: 'ACC-006-BIZ', accountName: 'GlobalTrade Business', accountType: 'Business',
        currency: 'USD', balance: 800000, availableBalance: 800000, owner: users[3]._id, company: companies[1]._id,
      },
    ]);
    console.log(`Created ${accounts.length} accounts.`);

    const categories = ['Payroll', 'Vendor Payment', 'Client Receipt', 'Loan Payment', 'Tax Payment', 'Utilities', 'Rent', 'Insurance', 'Investment', 'Refund'];
    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
      const daysAgo = Math.floor(Math.random() * 365);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      const isCredit = Math.random() > 0.5;
      const companyIdx = Math.random() > 0.3 ? 0 : 1;
      const companyAccounts = accounts.filter((a) => a.company.toString() === companies[companyIdx]._id.toString());
      const companyUsers = users.filter((u) => u.company.toString() === companies[companyIdx]._id.toString());

      const fromAcct = companyAccounts[Math.floor(Math.random() * companyAccounts.length)];
      const toAcct = companyAccounts[Math.floor(Math.random() * companyAccounts.length)];

      transactions.push({
        transactionId: `TXN-SEED-${String(i + 1).padStart(4, '0')}`,
        type: isCredit ? 'credit' : 'debit',
        amount: Math.round((Math.random() * 50000 + 100) * 100) / 100,
        currency: 'USD',
        description: `${isCredit ? 'Payment received' : 'Payment sent'} - Transaction ${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: 'completed',
        fromAccount: isCredit ? toAcct._id : fromAcct._id,
        toAccount: isCredit ? fromAcct._id : toAcct._id,
        initiatedBy: companyUsers[Math.floor(Math.random() * companyUsers.length)]._id,
        company: companies[companyIdx]._id,
        createdAt: date,
        updatedAt: date,
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions.`);

    console.log('\nSeed data created successfully!');
    console.log('\nTest credentials:');
    console.log('  Admin: admin@acmecorp.com / Password123');
    console.log('  Manager: manager@acmecorp.com / Password123');
    console.log('  Employee: employee@acmecorp.com / Password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
