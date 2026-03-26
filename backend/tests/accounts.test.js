const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../src/server');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const Account = require('../src/models/Account');

let mongoServer;
let company;
let user;
let token;
let account;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  company = await Company.create({
    name: 'Test Corp',
    registrationNumber: 'TC-001',
    industry: 'Finance',
  });

  const registerRes = await request(app).post('/api/auth/register').send({
    firstName: 'Account',
    lastName: 'Tester',
    email: 'accttest@example.com',
    password: 'Password123',
    company: company._id,
  });
  token = registerRes.body.data.token;
  user = registerRes.body.data.user;

  const dbUser = await User.findById(user.id);
  dbUser.company = company._id;
  await dbUser.save();

  account = await Account.create({
    accountNumber: 'TEST-ACC-001',
    accountName: 'Test Checking',
    accountType: 'Checking',
    currency: 'USD',
    balance: 10000,
    availableBalance: 9500,
    owner: user.id,
    company: company._id,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('GET /api/accounts', () => {
  it('should return user accounts', async () => {
    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fail without auth', async () => {
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/accounts/:id', () => {
  it('should return account by id', async () => {
    const res = await request(app)
      .get(`/api/accounts/${account._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.accountNumber).toBe('TEST-ACC-001');
  });

  it('should return 404 for non-existent account', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/accounts/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/accounts/:id/balance', () => {
  it('should return account balance', async () => {
    const res = await request(app)
      .get(`/api/accounts/${account._id}/balance`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.balance).toBe(10000);
    expect(res.body.data.availableBalance).toBe(9500);
  });
});
