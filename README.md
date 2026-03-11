# Cashflow Prototype

A commercial cashflow management prototype application built with React (frontend) and Node.js/Express (backend) with MongoDB.

## Features

- **User Authentication**: JWT-based auth with role-based access control (Admin, Manager, Employee)
- **Account Management**: View account balances, details, and summaries
- **Transaction Management**: View, filter, and initiate fund transfers
- **Cashflow Analytics**: Visual charts for cash-in/out trends, monthly reports, top payees/recipients
- **Report Export**: Download reports in CSV and PDF format
- **Responsive Dashboard**: Interactive UI for commercial banking users

## Tech Stack

- **Frontend**: React 18, Material UI, Recharts, Axios
- **Backend**: Node.js, Express, Mongoose, JWT
- **Database**: MongoDB
- **API Docs**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas connection string)

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # Seed the database with sample data
npm start       # Starts on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start       # Starts on http://localhost:3000
```

### API Documentation

Once the backend is running, visit `http://localhost:5000/api-docs` for the Swagger UI.
