require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const Company = require('../models/Company');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashflow';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({}),
    ]);

    // Create companies
    const companies = await Company.create([
      {
        name: 'Acme Corporation',
        registrationNumber: 'ACM-001',
        industry: 'Technology',
        address: {
          street: '100 Tech Park Drive',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'US',
        },
        contactEmail: 'admin@acmecorp.com',
        contactPhone: '+1-555-0100',
      },
      {
        name: 'Global Trading Inc',
        registrationNumber: 'GTI-002',
        industry: 'Finance',
        address: {
          street: '200 Wall Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10005',
          country: 'US',
        },
        contactEmail: 'info@globaltrading.com',
        contactPhone: '+1-555-0200',
      },
    ]);

    // Create users (password will be hashed by the pre-save hook)
    const users = await User.create([
      {
        firstName: 'John',
        lastName: 'Admin',
        email: 'admin@acmecorp.com',
        password: 'Admin@123',
        role: 'Admin',
        company: companies[0]._id,
      },
      {
        firstName: 'Jane',
        lastName: 'Manager',
        email: 'manager@acmecorp.com',
        password: 'Manager@123',
        role: 'Manager',
        company: companies[0]._id,
      },
      {
        firstName: 'Bob',
        lastName: 'Employee',
        email: 'employee@acmecorp.com',
        password: 'Employee@123',
        role: 'Employee',
        company: companies[0]._id,
      },
      {
        firstName: 'Alice',
        lastName: 'Admin',
        email: 'admin@globaltrading.com',
        password: 'Admin@123',
        role: 'Admin',
        company: companies[1]._id,
      },
    ]);

    // Create accounts
    const accounts = await Account.create([
      {
        accountNumber: 'ACC-ACME-CHK-001',
        accountName: 'Acme Operating Account',
        accountType: 'Checking',
        currency: 'USD',
        balance: 500000,
        availableBalance: 485000,
        company: companies[0]._id,
        owner: users[0]._id,
      },
      {
        accountNumber: 'ACC-ACME-SAV-001',
        accountName: 'Acme Savings Reserve',
        accountType: 'Savings',
        currency: 'USD',
        balance: 1200000,
        availableBalance: 1200000,
        company: companies[0]._id,
        owner: users[0]._id,
      },
      {
        accountNumber: 'ACC-ACME-BUS-001',
        accountName: 'Acme Business Account',
        accountType: 'Business',
        currency: 'USD',
        balance: 750000,
        availableBalance: 730000,
        company: companies[0]._id,
        owner: users[1]._id,
      },
      {
        accountNumber: 'ACC-ACME-TRS-001',
        accountName: 'Acme Treasury Account',
        accountType: 'Treasury',
        currency: 'USD',
        balance: 3000000,
        availableBalance: 2950000,
        company: companies[0]._id,
        owner: users[0]._id,
      },
      {
        accountNumber: 'ACC-GTI-CHK-001',
        accountName: 'GTI Operating Account',
        accountType: 'Checking',
        currency: 'USD',
        balance: 800000,
        availableBalance: 790000,
        company: companies[1]._id,
        owner: users[3]._id,
      },
    ]);

    // Create transactions
    const transactionData = [];
    const categories = ['Payroll', 'Vendor Payment', 'Client Payment', 'Loan', 'Tax', 'Utility', 'Investment', 'Transfer'];
    const payees = ['TechVendor Inc', 'Office Supplies Co', 'Cloud Services LLC', 'Marketing Agency', 'Insurance Corp', 'Legal Partners LLP', 'Consulting Group', 'Utility Provider'];
    const recipients = ['Client Alpha', 'Client Beta', 'Client Gamma', 'Investment Returns', 'Partner Revenue', 'Service Income'];

    // Generate 6 months of transaction history
    for (let m = 0; m < 6; m++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - m);

      for (let d = 0; d < 20; d++) {
        const txnDate = new Date(monthDate);
        txnDate.setDate(Math.floor(Math.random() * 28) + 1);

        // Credit transaction
        transactionData.push({
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          type: 'Credit',
          amount: Math.floor(Math.random() * 50000) + 1000,
          currency: 'USD',
          description: `Payment received from ${recipients[Math.floor(Math.random() * recipients.length)]}`,
          category: 'Client Payment',
          status: 'Completed',
          toAccount: accounts[0]._id,
          company: companies[0]._id,
          initiatedBy: users[0]._id,
          completedAt: txnDate,
          createdAt: txnDate,
          metadata: {
            payee: recipients[Math.floor(Math.random() * recipients.length)],
          },
        });

        // Debit transaction
        const payee = payees[Math.floor(Math.random() * payees.length)];
        transactionData.push({
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-D`,
          type: 'Debit',
          amount: Math.floor(Math.random() * 30000) + 500,
          currency: 'USD',
          description: `Payment to ${payee}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          status: 'Completed',
          fromAccount: accounts[0]._id,
          company: companies[0]._id,
          initiatedBy: users[1]._id,
          completedAt: txnDate,
          createdAt: txnDate,
          metadata: {
            payee,
            memo: `Invoice payment - ${Math.floor(Math.random() * 10000)}`,
          },
        });
      }
    }

    // Add some transfer transactions
    for (let i = 0; i < 10; i++) {
      const txnDate = new Date();
      txnDate.setDate(txnDate.getDate() - Math.floor(Math.random() * 60));

      transactionData.push({
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-T`,
        type: 'Transfer',
        amount: Math.floor(Math.random() * 100000) + 5000,
        currency: 'USD',
        description: 'Internal transfer',
        category: 'Transfer',
        status: 'Completed',
        fromAccount: accounts[0]._id,
        toAccount: accounts[1]._id,
        company: companies[0]._id,
        initiatedBy: users[0]._id,
        completedAt: txnDate,
        createdAt: txnDate,
        metadata: {
          payee: 'Acme Savings Reserve',
          payeeAccount: accounts[1].accountNumber,
        },
      });
    }

    await Transaction.insertMany(transactionData);

    // eslint-disable-next-line no-console
    console.log('Database seeded successfully!');
    // eslint-disable-next-line no-console
    console.log(`  Companies: ${companies.length}`);
    // eslint-disable-next-line no-console
    console.log(`  Users: ${users.length}`);
    // eslint-disable-next-line no-console
    console.log(`  Accounts: ${accounts.length}`);
    // eslint-disable-next-line no-console
    console.log(`  Transactions: ${transactionData.length}`);
    // eslint-disable-next-line no-console
    console.log('\nTest Credentials:');
    // eslint-disable-next-line no-console
    console.log('  Admin: admin@acmecorp.com / Admin@123');
    // eslint-disable-next-line no-console
    console.log('  Manager: manager@acmecorp.com / Manager@123');
    // eslint-disable-next-line no-console
    console.log('  Employee: employee@acmecorp.com / Employee@123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
