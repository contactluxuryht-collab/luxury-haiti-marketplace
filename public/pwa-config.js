// PWA Configuration for Luxury Haiti Marketplace
// This file contains PWA-related configuration and utilities

const PWA_CONFIG = {
  // App Information
  appName: 'Luxury Haiti',
  appShortName: 'Luxury Haiti',
  appDescription: 'Discover premium products from Haiti and beyond - your luxury marketplace for authentic Haitian goods',
  
  // Theme Colors
  themeColor: '#ff6b35',
  backgroundColor: '#fafafa',
  
  // Display Settings
  display: 'standalone',
  orientation: 'portrait-primary',
  
  // Cache Configuration
  cacheVersion: '1.0.0',
  staticCacheName: 'luxury-haiti-static-v1.0.0',
  dynamicCacheName: 'luxury-haiti-dynamic-v1.0.0',
  
  // Offline Configuration
  offlinePage: '/offline.html',
  
  // Install Prompt Configuration
  installPromptDelay: 3000, // 3 seconds
  iosPromptDelay: 5000, // 5 seconds for iOS
  
  // Features
  features: {
    pushNotifications: true,
    backgroundSync: true,
    offlineSupport: true,
    installPrompt: true
  }
};

// PWA Utilities
const PWAUtils = {
  // Check if PWA is installable
  isInstallable: () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },
  
  // Check if running on iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  // Check if app is in standalone mode
  isStandalone: () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  },
  
  // Get device type
  getDeviceType: () => {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    if (/Windows/.test(userAgent)) return 'windows';
    if (/Mac/.test(userAgent)) return 'mac';
    return 'unknown';
  },
  
  // Check if device supports PWA installation
  supportsPWAInstall: () => {
    const deviceType = PWAUtils.getDeviceType();
    return ['ios', 'android'].includes(deviceType);
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PWA_CONFIG, PWAUtils };
} else if (typeof window !== 'undefined') {
  (window as any).PWA_CONFIG = PWA_CONFIG;
  (window as any).PWAUtils = PWAUtils;
}
