import React, { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AboutUs from './components/AboutUs';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { AuthProvider } from './context/AuthContext';
import { ListingProvider } from './context/ListingContext';
import { BidProvider } from './context/BidContext';
import { CompanyProvider } from './context/CompanyContext';
import { PortfolioProvider } from './context/PortfolioContext';

export default function App() {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'about':
        return <AboutUs setPage={setPage} />;
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
            <PortfolioProvider>
              <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
                {page !== 'user' && page !== 'admin' && page !== 'about' && <Header setPage={setPage} currentPage={page} />}
                {renderPage()}
                <PWAInstallPrompt />
              </div>
            </PortfolioProvider>
          </CompanyProvider>
        </ListingProvider>
      </BidProvider>
    </AuthProvider>
  );
}
