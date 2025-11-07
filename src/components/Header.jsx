import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import ChangePassword from './ChangePassword';
import LoginModal from './LoginModal';

export default function Header({ setPage, currentPage }) {
  const { user, logout, currentRole, switchRole } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Hide navigation on dashboard and admin pages
  const isDashboardPage = currentPage === 'dashboard' || currentPage === 'admin';

  return (
    <header className={`w-full ${isDashboardPage ? 'bg-transparent' : 'bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 shadow-lg'} sticky top-0 z-50 backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <button 
            onClick={() => setPage('home')} 
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 group-hover:opacity-75 transition"></div>
              <img 
                src="/images/logos/logo.png" 
                alt="Nlist Logo" 
                className="relative h-12 w-12 object-contain transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-black text-white tracking-tight group-hover:tracking-wide transition-all duration-300">
                Nlist
              </span>
              <span className="text-xs text-white/90 font-medium -mt-1">
                Unlisted Shares
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          {!isDashboardPage && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setPage('home')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  currentPage === 'home'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🏠 Home
              </button>
              <button
                onClick={() => setPage('about')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  currentPage === 'about'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                ℹ️ About
              </button>
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* User Avatar & Name */}
                <div className="hidden sm:flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <span className="text-white font-semibold text-sm max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>

                {/* Dashboard Button */}
                <button
                  onClick={() => setPage(currentRole === 'admin' ? 'admin' : 'user')}
                  className="bg-white text-purple-600 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </button>

                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                  >
                    {showMenu ? '✕' : '☰'}
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slideDown">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                        <p className="text-white font-bold text-sm">{user.name}</p>
                        <p className="text-white/80 text-xs">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition-colors flex items-center space-x-3 text-gray-700 hover:text-purple-600"
                        >
                          <span>👤</span>
                          <span className="font-semibold text-sm">Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowPasswordModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition-colors flex items-center space-x-3 text-gray-700 hover:text-purple-600"
                        >
                          <span>🔒</span>
                          <span className="font-semibold text-sm">Change Password</span>
                        </button>

                        {user.roles?.length > 1 && (
                          <button
                            onClick={() => {
                              switchRole();
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition-colors flex items-center space-x-3 text-gray-700 hover:text-purple-600"
                          >
                            <span>🔄</span>
                            <span className="font-semibold text-sm">
                              Switch to {currentRole === 'admin' ? 'User' : 'Admin'}
                            </span>
                          </button>
                        )}

                        <div className="border-t border-gray-100 my-2"></div>

                        <button
                          onClick={() => {
                            logout();
                            setShowMenu(false);
                            setPage('home');
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600 font-semibold"
                        >
                          <span>🚪</span>
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-white text-purple-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>🔐</span>
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </div>

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
