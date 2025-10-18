import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Bell, BellOff, Smartphone, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const {
    isSupported,
    isEnabled,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showTestNotification
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const newPermission = await requestPermission();
      if (newPermission === 'granted') {
        toast.success('Notification permission granted!');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribeToPush = async () => {
    setIsLoading(true);
    try {
      const success = await subscribeToPush();
      if (success) {
        toast.success('Successfully subscribed to push notifications!');
      } else {
        toast.error('Failed to subscribe to push notifications');
      }
    } catch (error) {
      toast.error('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        toast.success('Successfully unsubscribed from push notifications');
      } else {
        toast.error('Failed to unsubscribe from push notifications');
      }
    } catch (error) {
      toast.error('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    try {
      await showTestNotification();
      toast.success('Test notification sent!');
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setTestLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="h-5 w-5 text-gray-400" />
            <span>Notifications Not Supported</span>
          </CardTitle>
          <CardDescription>
            Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span>Notification Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your notification preferences for Luxury Haiti marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Browser Permission</Label>
              <div className="flex items-center space-x-2">
                {permission === 'granted' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm text-gray-600 capitalize">
                  {permission === 'granted' ? 'Granted' : permission === 'denied' ? 'Denied' : 'Not Requested'}
                </span>
              </div>
            </div>
            {permission !== 'granted' && (
              <Button
                onClick={handleRequestPermission}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? 'Requesting...' : 'Request Permission'}
              </Button>
            )}
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Push Notifications</Label>
              <div className="flex items-center space-x-2">
                {isSubscribed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Receive notifications even when the app is closed
              </p>
            </div>
            <div className="flex space-x-2">
              {isSubscribed ? (
                <Button
                  onClick={handleUnsubscribeFromPush}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                </Button>
              ) : (
                <Button
                  onClick={handleSubscribeToPush}
                  disabled={isLoading || !isEnabled}
                  size="sm"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              )}
            </div>
          </div>

          {/* Test Notification */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Test Notifications</Label>
              <p className="text-xs text-gray-500">
                Send a test notification to verify everything is working
              </p>
            </div>
            <Button
              onClick={handleTestNotification}
              disabled={testLoading || !isEnabled}
              variant="outline"
              size="sm"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testLoading ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-orange-600" />
            <span>Notification Types</span>
          </CardTitle>
          <CardDescription>
            You'll receive notifications for these events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch id="order-notifications" defaultChecked disabled />
                <Label htmlFor="order-notifications" className="text-sm">
                  Order Updates
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-8">
                Order confirmations, shipping updates, delivery notifications
              </p>

              <div className="flex items-center space-x-3">
                <Switch id="price-notifications" defaultChecked disabled />
                <Label htmlFor="price-notifications" className="text-sm">
                  Price Drops
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-8">
                Notifications when items in your wishlist go on sale
              </p>

              <div className="flex items-center space-x-3">
                <Switch id="stock-notifications" defaultChecked disabled />
                <Label htmlFor="stock-notifications" className="text-sm">
                  Stock Alerts
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-8">
                When out-of-stock items become available again
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch id="new-product-notifications" defaultChecked disabled />
                <Label htmlFor="new-product-notifications" className="text-sm">
                  New Products
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-8">
                New arrivals in categories you're interested in
              </p>

              <div className="flex items-center space-x-3">
                <Switch id="promotion-notifications" defaultChecked disabled />
                <Label htmlFor="promotion-notifications" className="text-sm">
                  Promotions
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-8">
                Special offers, discounts, and exclusive deals
              </p>

              <div className="flex items-center space-x-3">
                <Switch id="cart-notifications" defaultChecked disabled />
                <Label htmlFor="cart-notifications" className="text-sm">
                  Cart Reminders
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-8">
                Gentle reminders about items left in your cart
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
