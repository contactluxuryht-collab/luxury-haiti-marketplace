import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { CheckCircle, Smartphone, Wifi, WifiOff } from 'lucide-react';

const PWAStatusIndicator: React.FC = () => {
  const { isInstalled, isStandalone, isIOS } = usePWA();

  // Only show in development or for debugging
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-xs">
      <div className="flex items-center space-x-2 mb-2">
        <Smartphone className="h-4 w-4 text-blue-600" />
        <span className="font-semibold text-gray-900 dark:text-white">PWA Status</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {isInstalled ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-gray-300" />
          )}
          <span className="text-gray-600 dark:text-gray-400">
            {isInstalled ? 'Installed' : 'Not Installed'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isStandalone ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-gray-300" />
          )}
          <span className="text-gray-600 dark:text-gray-400">
            {isStandalone ? 'Standalone Mode' : 'Browser Mode'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isIOS ? (
            <CheckCircle className="h-3 w-3 text-blue-600" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-gray-300" />
          )}
          <span className="text-gray-600 dark:text-gray-400">
            {isIOS ? 'iOS Device' : 'Other Platform'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PWAStatusIndicator;
