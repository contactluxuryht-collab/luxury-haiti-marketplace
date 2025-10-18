import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Bell, CheckCircle, AlertCircle, Info, ShoppingBag, Package, Tag } from 'lucide-react';

export interface NotificationBannerData {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
}

interface NotificationBannerProps {
  notification: NotificationBannerData;
  onDismiss: (id: string) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.autoHide !== false) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className={`${getBackgroundColor()} border transition-all duration-300 ease-in-out transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {notification.message}
            </p>
            
            {notification.action && (
              <div className="mt-3">
                <Button
                  onClick={notification.action.onClick}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {notification.action.label}
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Notification Manager Component
interface NotificationManagerProps {
  children: React.ReactNode;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationBannerData[]>([]);

  const addNotification = (notification: Omit<NotificationBannerData, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationBannerData = {
      ...notification,
      id,
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Expose methods globally for easy access
  useEffect(() => {
    (window as any).addNotification = addNotification;
    (window as any).clearAllNotifications = clearAllNotifications;
  }, []);

  return (
    <div className="relative">
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {notifications.map((notification) => (
          <NotificationBanner
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
          />
        ))}
      </div>
      
      {children}
    </div>
  );
};

// Predefined notification helpers
export const notificationHelpers = {
  orderPlaced: (orderId: string, amount: number) => ({
    type: 'success' as const,
    title: 'Order Placed Successfully! 🎉',
    message: `Your order #${orderId} for $${amount} has been confirmed.`,
    action: {
      label: 'View Order',
      onClick: () => window.location.href = '/profile'
    }
  }),

  orderShipped: (orderId: string) => ({
    type: 'info' as const,
    title: 'Order Shipped! 📦',
    message: `Your order #${orderId} has been shipped and is on its way.`,
    action: {
      label: 'Track Order',
      onClick: () => window.location.href = '/profile'
    }
  }),

  orderDelivered: (orderId: string) => ({
    type: 'success' as const,
    title: 'Order Delivered! ✅',
    message: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
    action: {
      label: 'Rate Order',
      onClick: () => window.location.href = '/profile'
    }
  }),

  priceDrop: (productName: string, oldPrice: number, newPrice: number) => ({
    type: 'info' as const,
    title: 'Price Drop Alert! 💰',
    message: `${productName} price dropped from $${oldPrice} to $${newPrice}`,
    action: {
      label: 'View Product',
      onClick: () => window.location.href = '/marketplace'
    }
  }),

  wishlistAvailable: (productName: string) => ({
    type: 'info' as const,
    title: 'Wishlist Item Available! ⭐',
    message: `${productName} is back in stock!`,
    action: {
      label: 'View Product',
      onClick: () => window.location.href = '/wishlist'
    }
  }),

  newProduct: (productName: string, category: string) => ({
    type: 'info' as const,
    title: 'New Product Available! 🆕',
    message: `Check out the new ${productName} in ${category}`,
    action: {
      label: 'View Product',
      onClick: () => window.location.href = '/marketplace'
    }
  }),

  promotion: (message: string) => ({
    type: 'info' as const,
    title: 'Special Promotion! 🎁',
    message: message,
    action: {
      label: 'View Offers',
      onClick: () => window.location.href = '/marketplace'
    }
  }),

  cartReminder: () => ({
    type: 'warning' as const,
    title: 'Don\'t forget your cart! 🛒',
    message: 'You have items waiting in your cart. Complete your purchase now!',
    action: {
      label: 'View Cart',
      onClick: () => window.location.href = '/cart'
    }
  })
};

export default NotificationBanner;
