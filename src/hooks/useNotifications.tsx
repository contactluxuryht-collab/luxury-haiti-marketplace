import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { notificationService, PushSubscription } from '@/services/notificationService';

interface NotificationContextType {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  showTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');

      // Initialize notification service
      await notificationService.initialize();

      // Check if already subscribed to push notifications
      const subscription = await notificationService.getPushSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    setIsEnabled(newPermission === 'granted');
    return newPermission;
  };

  const subscribeToPush = async (): Promise<boolean> => {
    if (!isEnabled) {
      const perm = await requestPermission();
      if (perm !== 'granted') {
        return false;
      }
    }

    const subscription = await notificationService.subscribeToPush();
    if (subscription) {
      const success = await notificationService.sendSubscriptionToServer(subscription);
      if (success) {
        setIsSubscribed(true);
        return true;
      }
    }
    return false;
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    const success = await notificationService.unsubscribeFromPush();
    if (success) {
      setIsSubscribed(false);
      return true;
    }
    return false;
  };

  const showTestNotification = async (): Promise<void> => {
    await notificationService.showNotification({
      title: 'Test Notification 🧪',
      body: 'This is a test notification from Luxury Haiti!',
      tag: 'test',
      data: { type: 'test' }
    });
  };

  const value: NotificationContextType = {
    isSupported,
    isEnabled,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showTestNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default useNotifications;
