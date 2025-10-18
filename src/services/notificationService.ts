// Notification Service for Luxury Haiti Marketplace PWA
import { toast } from 'sonner';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  // Initialize notification service
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  // Show local notification
  async showNotification(data: NotificationData): Promise<void> {
    if (!this.isEnabled() || !this.registration) {
      // Fallback to toast notification
      this.showToastNotification(data);
      return;
    }

    try {
      const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-192x192.png',
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        actions: data.actions,
        vibrate: [100, 50, 100],
        timestamp: Date.now()
      };

      await this.registration.showNotification(data.title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Fallback to toast
      this.showToastNotification(data);
    }
  }

  // Show toast notification as fallback
  private showToastNotification(data: NotificationData): void {
    toast.success(data.title, {
      description: data.body,
      duration: 4000,
    });
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isEnabled() || !this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI0lF3N2QOA9HXgK8sK1CJ_3b0k8XQ2nJ1U8vY0pA6rT9sE4iW7oU2yQ5'
        )
      });

      return subscription as PushSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Get current push subscription
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription as PushSubscription;
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      return false;
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Notification types for different events
  async notifyOrderPlaced(orderId: string, total: number): Promise<void> {
    await this.showNotification({
      title: 'Order Placed Successfully! 🎉',
      body: `Your order #${orderId} for $${total} has been confirmed.`,
      tag: 'order-placed',
      data: { orderId, type: 'order' },
      actions: [
        { action: 'view-order', title: 'View Order', icon: '/icons/icon-192x192.png' },
        { action: 'track-order', title: 'Track Order', icon: '/icons/icon-192x192.png' }
      ]
    });
  }

  async notifyOrderShipped(orderId: string): Promise<void> {
    await this.showNotification({
      title: 'Order Shipped! 📦',
      body: `Your order #${orderId} has been shipped and is on its way.`,
      tag: 'order-shipped',
      data: { orderId, type: 'shipping' },
      actions: [
        { action: 'track-order', title: 'Track Order', icon: '/icons/icon-192x192.png' }
      ]
    });
  }

  async notifyOrderDelivered(orderId: string): Promise<void> {
    await this.showNotification({
      title: 'Order Delivered! ✅',
      body: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
      tag: 'order-delivered',
      data: { orderId, type: 'delivery' },
      actions: [
        { action: 'rate-order', title: 'Rate Order', icon: '/icons/icon-192x192.png' }
      ]
    });
  }

  async notifyPriceDrop(productName: string, oldPrice: number, newPrice: number): Promise<void> {
    await this.showNotification({
      title: 'Price Drop Alert! 💰',
      body: `${productName} price dropped from $${oldPrice} to $${newPrice}`,
      tag: 'price-drop',
      data: { productName, oldPrice, newPrice, type: 'price' },
      actions: [
        { action: 'view-product', title: 'View Product', icon: '/icons/icon-192x192.png' }
      ]
    });
  }

  async notifyWishlistItemAvailable(productName: string): Promise<void> {
    await this.showNotification({
      title: 'Wishlist Item Available! ⭐',
      body: `${productName} is back in stock!`,
      tag: 'wishlist-available',
      data: { productName, type: 'wishlist' },
      actions: [
        { action: 'view-product', title: 'View Product', icon: '/icons/icon-192x192.png' },
        { action: 'add-to-cart', title: 'Add to Cart', icon: '/icons/icon-192x192.png' }
      ]
    });
  }

  async notifyNewProduct(productName: string, category: string): Promise<void> {
    await this.showNotification({
      title: 'New Product Available! 🆕',
      body: `Check out the new ${productName} in ${category}`,
      tag: 'new-product',
      data: { productName, category, type: 'new-product' },
      actions: [
        { action: 'view-product', title: 'View Product', icon: '/icons/icon-192x192.png' }
      ]
    });
  }

  async notifyPromotion(message: string): Promise<void> {
    await this.showNotification({
      title: 'Special Promotion! 🎁',
      body: message,
      tag: 'promotion',
      data: { type: 'promotion' },
      actions: [
        { action: 'view-offers', title: 'View Offers', icon: '/icons/icon-192x192.png' }
      ]
    });
  }

  async notifyCartReminder(): Promise<void> {
    await this.showNotification({
      title: 'Don\'t forget your cart! 🛒',
      body: 'You have items waiting in your cart. Complete your purchase now!',
      tag: 'cart-reminder',
      data: { type: 'cart' },
      actions: [
        { action: 'view-cart', title: 'View Cart', icon: '/icons/icon-192x192.png' }
      ]
    });
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
export default notificationService;
