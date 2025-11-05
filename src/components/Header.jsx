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
    <header className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${isDashboardPage ? 'w-full' : (isScrolled ? 'w-11/12 max-w-4xl' : 'w-full max-w-7xl')}`}>
      <div className={`mx-auto px-6 flex justify-between items-center rounded-2xl transition-all duration-300 ${isDashboardPage ? 'bg-transparent py-3' : (isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 py-2' : 'bg-transparent py-4')}`}>
        <button onClick={() => setPage('home')} className="flex items-center cursor-pointer hover:opacity-80 transition">
          <img 
            src="/images/logos/logo.png" 
            alt="Nlisted Logo" 
            className={`object-contain transition-all duration-300 ${isScrolled ? 'h-12 w-12' : 'h-20 w-20'}`}
          />
          {!isScrolled && <span className="text-3xl font-bold text-gray-800 hover:text-purple-600 transition -ml-4">listed</span>}
        </button>
        
        {!isDashboardPage && (
          <nav className="hidden md:flex gap-2">
            <button onClick={() => setPage('home')} className="relative px-4 py-2 text-gray-700 font-bold transition-all duration-300 hover:text-purple-600 group">
              <span className="relative z-10">Home</span>
              <span className="absolute inset-0 bg-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </button>
            {user && (
              <button onClick={() => setPage(user.roles.includes('admin') ? 'admin' : 'user')} className="relative px-4 py-2 text-gray-700 font-bold transition-all duration-300 hover:text-purple-600 group">
                <span className="relative z-10">👤 Dashboard</span>
                <span className="absolute inset-0 bg-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
              </button>
            )}
            <button onClick={() => setPage('buy')} className="relative px-4 py-2 text-gray-700 font-bold transition-all duration-300 hover:text-purple-600 group">
              <span className="relative z-10">Buy</span>
              <span className="absolute inset-0 bg-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </button>
            <button onClick={() => setPage('about')} className="relative px-4 py-2 text-gray-700 font-bold transition-all duration-300 hover:text-purple-600 group">
              <span className="relative z-10">About Us</span>
              <span className="absolute inset-0 bg-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </button>
            {user && (
              <>
                {user.roles.includes('admin') && (
                  <button onClick={() => setPage('admin')} className="relative px-4 py-2 text-gray-700 font-bold transition-all duration-300 hover:text-purple-600 group">
                    <span className="relative z-10">⚙️ Admin</span>
                    <span className="absolute inset-0 bg-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  </button>
                )}
              </>
            )}
          </nav>
        )}

        {/* Hide profile icon on dashboard - options moved to sidebar */}
        {!isDashboardPage && user ? (
          <div className="relative menu-container">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform shadow-lg"
              title={user.name}
            >
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button 
                  onClick={() => { setShowProfileModal(true); setShowMenu(false); }} 
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold">User Profile</span>
                </button>
                <button 
                  onClick={() => { setShowPasswordModal(true); setShowMenu(false); }} 
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="font-semibold">Change Password</span>
                </button>
                <button 
                  onClick={() => { logout(); setPage('home'); setShowMenu(false); }} 
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition rounded-b-xl flex items-center gap-3 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : !isDashboardPage && !user && (
          <div className="relative menu-container">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="bg-purple-600 text-white p-3 rounded-full font-bold hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-300 group transform hover:scale-105"
              title="Sign In / Sign Up"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200">
                <button 
                  onClick={() => { setShowLoginModal(true); setShowMenu(false); }} 
                  className="w-full text-left px-4 py-3 text-purple-600 font-semibold hover:bg-purple-50 transition rounded-t-xl"
                >
                  🔑 Sign In
                </button>
                <button 
                  onClick={() => { setShowLoginModal(true); setShowMenu(false); }} 
                  className="w-full text-left px-4 py-3 text-purple-600 font-semibold hover:bg-purple-50 transition rounded-b-xl"
                >
                  ✍️ Sign Up
                </button>
              </div>
            )}
          </div>
        )}
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
