import React, { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (standalone) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('✅ PWA installed successfully');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleIOSClose = () => {
    localStorage.setItem('ios-install-prompt-dismissed', 'true');
    setShowInstallButton(false);
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS && !localStorage.getItem('ios-install-prompt-dismissed')) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-2xl z-50 animate-slideUp">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <img src="/images/logos/logo.png" alt="Nlisted" className="w-12 h-12 rounded-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Install Nlisted App</h3>
              <p className="text-sm text-purple-100 mb-3">
                Add to Home Screen for the best experience:
              </p>
              <ol className="text-sm text-purple-100 space-y-1 mb-3">
                <li className="flex items-center gap-2">
                  <span className="text-lg">1️⃣</span>
                  <span>Tap the <strong>Share</strong> button <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/></svg></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">2️⃣</span>
                  <span>Scroll and tap <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">3️⃣</span>
                  <span>Tap <strong>"Add"</strong> to confirm</span>
                </li>
              </ol>
            </div>
            <button
              onClick={handleIOSClose}
              className="flex-shrink-0 text-white hover:text-purple-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Button
  if (showInstallButton && deferredPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-bounce">
        <button
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" />
          </svg>
          <span>Install App</span>
        </button>
      </div>
    );
  }

  return null;
}
