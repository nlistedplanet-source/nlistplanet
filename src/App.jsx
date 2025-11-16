import React, { useCallback, useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AboutUs from './components/AboutUs';
import { AuthProvider } from './context/AuthContext';
import { ListingProvider } from './context/ListingContext';
import { BidProvider } from './context/BidContext';
import { CompanyProvider } from './context/CompanyContext';
import { PortfolioProvider } from './context/PortfolioContext';

export default function App() {
  const getInitialPage = useCallback(() => {
    // Always start with 'home' to avoid blank screen
    // User will be redirected after AuthContext loads
    return 'home';
  }, []);

  const [page, setPageState] = useState(() => getInitialPage());

  // Listen for auth restoration event to redirect
  useEffect(() => {
    const handleAuthRestored = (event) => {
      const { page: restoredPage } = event.detail;
      if (restoredPage) {
        setPageState(restoredPage);
      }
    };

    window.addEventListener('auth-restored', handleAuthRestored);
    return () => window.removeEventListener('auth-restored', handleAuthRestored);
  }, []);

  const setPage = useCallback((nextPage) => {
    setPageState(nextPage);
    if (typeof window !== 'undefined') {
      if (nextPage === 'user' || nextPage === 'admin') {
        localStorage.setItem('lastVisitedPage', nextPage);
      } else {
        localStorage.removeItem('lastVisitedPage');
      }
    }
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'marketplace':
        return <UserDashboard setPage={setPage} initialTab="marketplace" />;
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
                {page !== 'user' && page !== 'admin' && page !== 'about' && page !== 'marketplace' && <Header setPage={setPage} currentPage={page} />}
                {renderPage()}
              </div>
              <Analytics />
            </PortfolioProvider>
          </CompanyProvider>
        </ListingProvider>
      </BidProvider>
    </AuthProvider>
  );
}
