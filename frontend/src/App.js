import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import AccountList from './components/Dashboard/AccountList';
import TransactionList from './components/Transactions/TransactionList';
import TransferForm from './components/Transactions/TransferForm';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import Reports from './components/Analytics/Reports';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="accounts" element={<AccountList />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="transfer" element={<TransferForm />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
