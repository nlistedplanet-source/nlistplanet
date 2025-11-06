// Security Manager - Enhanced security for data protection
class SecurityManager {
  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.isEnabled = true;
    this.rateLimitMap = new Map();
    this.MAX_ATTEMPTS = 5;
    this.BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  }

  // Generate encryption key from device fingerprint
  generateEncryptionKey() {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width + 'x' + screen.height,
      navigator.hardwareConcurrency || 'unknown'
    ].join('|');
    
    return this.simpleHash(fingerprint);
  }

  // Simple hash function (for basic obfuscation)
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // XOR based encryption (simple but effective for localStorage)
  encrypt(text) {
    if (!this.isEnabled || !text) return text;
    
    try {
      const key = this.encryptionKey;
      let encrypted = '';
      
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
      }
      
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  }

  // XOR based decryption
  decrypt(encrypted) {
    if (!this.isEnabled || !encrypted) return encrypted;
    
    try {
      const key = this.encryptionKey;
      const decoded = atob(encrypted); // Base64 decode
      let decrypted = '';
      
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encrypted;
    }
  }

  // Secure localStorage setItem
  setSecureItem(key, value) {
    try {
      const encrypted = this.encrypt(JSON.stringify(value));
      localStorage.setItem(`secure_${key}`, encrypted);
      return true;
    } catch (error) {
      console.error('Error saving secure item:', error);
      return false;
    }
  }

  // Secure localStorage getItem
  getSecureItem(key) {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error reading secure item:', error);
      return null;
    }
  }

  // Rate limiting for API calls
  checkRateLimit(endpoint, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const key = `ratelimit_${endpoint}`;
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, []);
    }
    
    const requests = this.rateLimitMap.get(key);
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      console.warn(`⚠️ Rate limit exceeded for ${endpoint}`);
      return false;
    }
    
    validRequests.push(now);
    this.rateLimitMap.set(key, validRequests);
    return true;
  }

  // Login attempt tracking
  trackLoginAttempt(email, success) {
    const key = `login_${email}`;
    const now = Date.now();
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, { attempts: 0, blockedUntil: 0 });
    }
    
    const record = this.rateLimitMap.get(key);
    
    // Check if user is blocked
    if (record.blockedUntil > now) {
      const remainingTime = Math.ceil((record.blockedUntil - now) / 1000 / 60);
      throw new Error(`Account temporarily blocked. Try again in ${remainingTime} minutes.`);
    }
    
    if (success) {
      // Reset on successful login
      this.rateLimitMap.set(key, { attempts: 0, blockedUntil: 0 });
      return true;
    } else {
      // Increment failed attempts
      record.attempts++;
      
      if (record.attempts >= this.MAX_ATTEMPTS) {
        record.blockedUntil = now + this.BLOCK_DURATION;
        console.warn(`🔒 Account ${email} blocked for ${this.BLOCK_DURATION / 1000 / 60} minutes`);
      }
      
      this.rateLimitMap.set(key, record);
      return false;
    }
  }

  // XSS Protection - Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    
    return input.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  // SQL Injection Prevention - Validate inputs
  validateInput(input, type = 'text') {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      number: /^\d+$/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      text: /^[a-zA-Z0-9\s\-_.@]+$/,
      price: /^\d+(\.\d{1,2})?$/,
      isin: /^[A-Z]{2}[A-Z0-9]{9}\d$/
    };
    
    if (!patterns[type]) {
      console.warn(`Unknown validation type: ${type}`);
      return true;
    }
    
    return patterns[type].test(input);
  }

  // CSRF Token Generation
  generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Session timeout management
  initSessionTimeout(timeoutMs = 30 * 60 * 1000) { // 30 minutes default
    let timeoutId;
    
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        console.log('⏱️ Session timeout - Logging out for security');
        localStorage.removeItem('authUser');
        window.location.reload();
      }, timeoutMs);
    };
    
    // Reset timer on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
  }

  // Content Security Policy headers (for reference - needs server-side)
  getCSPHeaders() {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.example.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    };
  }

  // Detect and prevent console tampering
  protectConsole() {
    if (process.env.NODE_ENV === 'production') {
      // Disable console in production
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      
      // Detect DevTools opening
      const devtools = /./;
      devtools.toString = function() {
        this.opened = true;
      };
      
      setInterval(() => {
        if (devtools.opened) {
          console.clear();
          devtools.opened = false;
          // Optionally redirect or show warning
        }
      }, 1000);
    }
  }

  // Initialize all security features
  init() {
    console.log('🔒 Security Manager initialized');
    this.initSessionTimeout();
    // this.protectConsole(); // Uncomment for production
    
    // Add security headers meta tags
    this.addSecurityHeaders();
  }

  // Add security-related meta tags
  addSecurityHeaders() {
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];
    
    headers.forEach(({ name, content }) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = content;
      document.head.appendChild(meta);
    });
  }
}

// Create singleton instance
const securityManager = new SecurityManager();

// Make it available globally
window.securityManager = securityManager;

export default securityManager;
