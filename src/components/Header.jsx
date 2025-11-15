import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import ChangePassword from './ChangePassword';
import LoginModal from './LoginModal';

export default function Header({ setPage, currentPage }) {
  const { user, logout, currentRole } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide navigation on dashboard and admin pages
  const isDashboardPage = currentPage === 'dashboard' || currentPage === 'admin';

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isDashboardPage
          ? scrolled
            ? 'bg-white/80 border-b border-gray-200 shadow-sm'
            : 'bg-transparent'
          : scrolled
            ? 'bg-white/85 border-b border-gray-200 shadow-sm'
            : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50'
      }`}
    >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Taller header so the logo is fully visible */}
          <div className="flex justify-between items-end gap-6 min-h-[140px] py-4">

          {/* Logo Section - keep large logo but anchor it to the bottom to avoid cropping */}
          <div className="flex items-end gap-2 h-48">
            <img
              src="/images/logos/nlist_logo.svg"
              alt="NList Logo"
              className="h-full w-auto object-contain object-bottom"
              style={{ maxHeight: '192px' }}
            />
          </div>

          {/* Navigation Links */}
          {!isDashboardPage && (
            <nav className="hidden md:flex items-center gap-1 self-center">
              <button
                onClick={() => setPage('home')}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentPage === 'home'
                    ? 'text-purple-700 bg-purple-50 border border-purple-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setPage('about')}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentPage === 'about'
                    ? 'text-purple-700 bg-purple-50 border border-purple-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                About
              </button>
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 self-center">
            {user ? (
              <>
                {/* User Avatar & Name */}
                <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-3 py-1.5 border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <span className="text-gray-800 font-medium text-sm max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>

                {/* Dashboard Button */}
                <button
                  onClick={() => setPage(currentRole === 'admin' ? 'admin' : 'user')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-purple-700 transition"
                >
                  Dashboard
                </button>

                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white transition"
                  >
                    {showMenu ? '✕' : '☰'}
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideDown">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-gray-900 font-semibold text-sm">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                        >
                          <span className="font-medium text-sm">Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowPasswordModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                        >
                          <span className="font-medium text-sm">Change Password</span>
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={() => {
                            logout();
                            setShowMenu(false);
                            setPage('home');
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 font-medium"
                        >
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Mobile nav toggle */}
                {!isDashboardPage && (
                  <button
                    className="md:hidden w-10 h-10 rounded-full bg-white/70 border border-gray-200 text-gray-700"
                    onClick={() => setShowMobileNav((s) => !s)}
                    aria-label="Toggle navigation"
                  >
                    {showMobileNav ? '✕' : '☰'}
                  </button>
                )}

                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-purple-700 transition"
                >
                  Login / Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
        {/* Mobile Navigation Panel */}
        {!isDashboardPage && showMobileNav && (
          <div className="md:hidden pb-3 animate-slideDown">
            <div className="mt-2 grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setPage('home');
                  setShowMobileNav(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
                  currentPage === 'home'
                    ? 'text-purple-700 bg-purple-50 border border-purple-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setPage('about');
                  setShowMobileNav(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
                  currentPage === 'about'
                    ? 'text-purple-700 bg-purple-50 border border-purple-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                About
              </button>
            </div>
          </div>
        )}

      {/* Profile Modal */}
      {showProfileModal && <UserProfile onClose={() => setShowProfileModal(false)} />}
      
      {/* Change Password Modal */}
      {showPasswordModal && <ChangePassword onClose={() => setShowPasswordModal(false)} />}
      
      {/* Login/Signup Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} setPage={setPage} />

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
