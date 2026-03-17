# Cashflow Prototype

A commercial cashflow management application for banking users. Built with React (frontend) and Node.js/Express (backend) with MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Manager, Employee)
- **Account Management**: View account balances, details, and summaries
- **Transaction Management**: View transaction history with filtering, initiate fund transfers
- **Cashflow Analytics**: Cash-in/cash-out trends, monthly reports, top payees/recipients
- **Reporting**: Export reports in CSV and PDF format
- **Responsive Dashboard**: Interactive UI with charts and data visualization

## Tech Stack

- **Frontend**: React 18, Material UI, Recharts, React Router
- **Backend**: Node.js, Express, MongoDB with Mongoose
- **Auth**: JWT tokens, bcrypt password hashing
- **Testing**: Jest (backend), React Testing Library (frontend)

## Project Structure

```
cashflow-prototype/
├── backend/
│   ├── src/
│   │   ├── models/        # Mongoose data models
│   │   ├── routes/        # Express route handlers
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration
│   │   └── seeds/         # Database seed scripts
│   └── tests/             # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context providers
│   │   └── utils/         # Frontend utilities
│   └── public/            # Static assets
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB >= 6.0
- npm >= 9

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run seed   # Seed the database with sample data
npm run dev    # Start development server on port 5000
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env if backend URL differs
npm install
npm start      # Start development server on port 3000
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## API Documentation

The backend API is available at `http://localhost:5000/api`. Key endpoints:

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Accounts
- `GET /api/accounts` - List user accounts
- `GET /api/accounts/:id` - Get account details
- `GET /api/accounts/:id/balance` - Get account balance

### Transactions
- `GET /api/transactions` - List transactions (with filtering)
- `POST /api/transactions/transfer` - Initiate fund transfer
- `GET /api/transactions/:id` - Get transaction details

### Analytics
- `GET /api/analytics/cashflow-summary` - Cash-in/cash-out summary
- `GET /api/analytics/trends` - Cashflow trends over time
- `GET /api/analytics/top-payees` - Top payees/recipients
- `GET /api/analytics/monthly-report` - Monthly cashflow report

### Reports
- `GET /api/reports/export/csv` - Export report as CSV
- `GET /api/reports/export/pdf` - Export report as PDF

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cashflow_prototype
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## License

Proprietary - All Rights Reserved
