// Automatic Backup Manager - Backs up data every 3 hours
class BackupManager {
  constructor() {
    this.BACKUP_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    this.MAX_BACKUPS = 10; // Keep last 10 backups
    this.BACKUP_KEY_PREFIX = 'backup_';
    this.LAST_BACKUP_KEY = 'last_backup_time';
    this.isRunning = false;
  }

  // Initialize auto backup system
  init() {
    if (this.isRunning) return;
    
    console.log('🔄 Auto Backup System initialized');
    this.isRunning = true;
    
    // Check if backup is needed on init
    this.checkAndBackup();
    
    // Set interval for automatic backups
    this.intervalId = setInterval(() => {
      this.checkAndBackup();
    }, this.BACKUP_INTERVAL);
  }

  // Check if backup is needed and create one
  checkAndBackup() {
    const lastBackupTime = localStorage.getItem(this.LAST_BACKUP_KEY);
    const now = Date.now();
    
    if (!lastBackupTime || (now - parseInt(lastBackupTime)) >= this.BACKUP_INTERVAL) {
      this.createBackup();
    }
  }

  // Create a new backup
  createBackup() {
    try {
      const timestamp = Date.now();
      const backupData = {
        timestamp,
        date: new Date(timestamp).toISOString(),
        data: {
          sellListings: localStorage.getItem('sellListings') || '[]',
          buyRequests: localStorage.getItem('buyRequests') || '[]',
          portfolioHoldings: localStorage.getItem('portfolioHoldings') || '[]',
          portfolioTransactions: localStorage.getItem('portfolioTransactions') || '[]',
          authUser: localStorage.getItem('authUser') || null
        }
      };

      // Save backup
      const backupKey = `${this.BACKUP_KEY_PREFIX}${timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      localStorage.setItem(this.LAST_BACKUP_KEY, timestamp.toString());

      // Clean old backups
      this.cleanOldBackups();

      console.log(`✅ Backup created successfully at ${backupData.date}`);
      return true;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      return false;
    }
  }

  // Remove old backups keeping only MAX_BACKUPS
  cleanOldBackups() {
    try {
      const backupKeys = [];
      
      // Find all backup keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.BACKUP_KEY_PREFIX)) {
          backupKeys.push(key);
        }
      }

      // Sort by timestamp (newest first)
      backupKeys.sort((a, b) => {
        const timeA = parseInt(a.replace(this.BACKUP_KEY_PREFIX, ''));
        const timeB = parseInt(b.replace(this.BACKUP_KEY_PREFIX, ''));
        return timeB - timeA;
      });

      // Remove old backups
      if (backupKeys.length > this.MAX_BACKUPS) {
        const toRemove = backupKeys.slice(this.MAX_BACKUPS);
        toRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed old backup: ${key}`);
        });
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  // Get all backups
  getAllBackups() {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.BACKUP_KEY_PREFIX)) {
        try {
          const backup = JSON.parse(localStorage.getItem(key));
          backups.push({
            key,
            ...backup
          });
        } catch (error) {
          console.error(`Error reading backup ${key}:`, error);
        }
      }
    }

    // Sort by timestamp (newest first)
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Restore from a specific backup
  restoreBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const backup = JSON.parse(backupData);
      
      // Restore data
      Object.keys(backup.data).forEach(key => {
        if (backup.data[key]) {
          localStorage.setItem(key, backup.data[key]);
        }
      });

      console.log(`✅ Data restored from backup: ${backup.date}`);
      return true;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return false;
    }
  }

  // Export backup as downloadable file
  exportBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nlisted-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Backup exported successfully');
      return true;
    } catch (error) {
      console.error('❌ Export failed:', error);
      return false;
    }
  }

  // Import backup from file
  importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          // Validate backup structure
          if (!backup.data || !backup.timestamp) {
            throw new Error('Invalid backup file');
          }

          // Restore data
          Object.keys(backup.data).forEach(key => {
            if (backup.data[key]) {
              localStorage.setItem(key, backup.data[key]);
            }
          });

          console.log('✅ Backup imported successfully');
          resolve(true);
        } catch (error) {
          console.error('❌ Import failed:', error);
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Stop auto backup
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('🛑 Auto Backup System stopped');
    }
  }

  // Manual backup trigger
  manualBackup() {
    console.log('📦 Creating manual backup...');
    return this.createBackup();
  }
}

// Create singleton instance
const backupManager = new BackupManager();

// Make it available globally for console access
window.backupManager = backupManager;

export default backupManager;
