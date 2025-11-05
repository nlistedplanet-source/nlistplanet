import React, { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { AuthProvider } from './context/AuthContext';
import { ListingProvider } from './context/ListingContext';
import { BidProvider } from './context/BidContext';
import { CompanyProvider } from './context/CompanyContext';

export default function App() {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'admin':
        return <AdminDashboard setPage={setPage} />;
      case 'user':
        return <UserDashboard setPage={setPage} />;
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
    <AuthProvider>
      <BidProvider>
        <ListingProvider>
          <CompanyProvider>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
              {page !== 'user' && page !== 'admin' && <Header setPage={setPage} currentPage={page} />}
              {renderPage()}
            </div>
          </CompanyProvider>
        </ListingProvider>
      </BidProvider>
    </AuthProvider>
  );
}
