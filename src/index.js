import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './utils/sampleData';
import backupManager from './utils/backupManager';
import securityManager from './utils/securityManager';

// Sample data functions are automatically available in console via utils/sampleData.js

// Initialize Security Manager
securityManager.init();
console.log('🔒 Security features enabled');

// Initialize Auto Backup System (every 3 hours)
backupManager.init();
console.log('💾 Auto backup system started (Every 3 hours)');

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

