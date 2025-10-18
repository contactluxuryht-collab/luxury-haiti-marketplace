import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { isIOS, isStandalone, canInstall, installPrompt } = usePWA();

  useEffect(() => {
    // Show install prompt after a delay to not be too aggressive
    if (canInstall) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    }

    // For iOS, show install instructions if not already installed
    if (isIOS && !isStandalone) {
      const hasSeenIOSPrompt = localStorage.getItem('hasSeenIOSPrompt');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000);
      }
    }
  }, [canInstall, isIOS, isStandalone]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    if (isIOS) {
      localStorage.setItem('hasSeenIOSPrompt', 'true');
    }
  };

  // Don't show if already installed or if no prompt available
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Install Luxury Haiti
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get the full app experience
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isIOS ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To install this app on your iPhone:
            </p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
              <li>Tap the Share button <span className="inline-block w-4 h-4 bg-gray-300 rounded mx-1"></span> in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to install</li>
            </ol>
            <Button
              onClick={handleDismiss}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Got it!
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Install our app for a better shopping experience with offline access and faster loading.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-3"
              >
                Later
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
