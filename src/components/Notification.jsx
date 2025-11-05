import React, { useEffect } from 'react';

const Notification = ({ show, onClose, type = 'success', title, message }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const styles = {
    success: {
      bg: 'from-emerald-500 to-teal-500',
      icon: '🎉',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      border: 'border-emerald-200'
    },
    error: {
      bg: 'from-red-500 to-pink-500',
      icon: '❌',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      border: 'border-red-200'
    },
    info: {
      bg: 'from-blue-500 to-indigo-500',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      border: 'border-blue-200'
    },
    warning: {
      bg: 'from-yellow-500 to-orange-500',
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      border: 'border-yellow-200'
    }
  };

  const style = styles[type] || styles.success;

  return (
    <div className="fixed top-20 right-4 z-[100] animate-slideIn">
      <div className={`bg-white rounded-2xl shadow-2xl border-2 ${style.border} overflow-hidden w-96 transform transition-all duration-300 hover:scale-105`}>
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${style.bg} h-2`}></div>
        
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`${style.iconBg} ${style.iconText} w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 animate-bounce`}>
              {style.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div className={`h-full bg-gradient-to-r ${style.bg} animate-progress`}></div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
