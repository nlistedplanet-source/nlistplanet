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
    <header className={`w-full ${isDashboardPage ? 'bg-transparent' : 'bg-white border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center items-center">
        <button onClick={() => setPage('home')} className="flex items-center cursor-pointer hover:opacity-80 transition">
          <img 
            src="/images/logos/logo.png" 
            alt="Nlisted Logo" 
            className="h-16 w-16 object-contain"
          />
          <span className="text-3xl font-bold text-gray-800 hover:text-purple-600 transition -ml-4">List</span>
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
