import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import ChangePassword from './ChangePassword';
import LoginModal from './LoginModal';

export default function Header({ setPage, currentPage }) {
  const { user, logout, currentRole, switchRole } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Hide navigation on dashboard and admin pages
  const isDashboardPage = currentPage === 'dashboard' || currentPage === 'admin';

  useEffect(() => {
    // Don't apply scroll effect on dashboard pages
    if (isDashboardPage) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDashboardPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  return (
    <header className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${isDashboardPage ? 'w-full' : 'w-full max-w-7xl'}`}>
      <div className={`mx-auto px-6 flex justify-center items-center rounded-2xl transition-all duration-300 ${isDashboardPage ? 'bg-transparent py-3' : (isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 py-2' : 'bg-transparent py-4')}`}>
        <button onClick={() => setPage('home')} className="flex items-center cursor-pointer hover:opacity-80 transition">
          <img 
            src="/images/logos/logo.png" 
            alt="Nlisted Logo" 
            className={`object-contain transition-all duration-300 ${isScrolled ? 'h-12 w-12' : 'h-20 w-20'}`}
          />
          <span className={`font-bold text-gray-800 hover:text-purple-600 transition -ml-4 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>listed</span>
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && <UserProfile onClose={() => setShowProfileModal(false)} />}
      
      {/* Change Password Modal */}
      {showPasswordModal && <ChangePassword onClose={() => setShowPasswordModal(false)} />}
      
      {/* Login/Signup Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} setPage={setPage} />
    </header>
  );
}
