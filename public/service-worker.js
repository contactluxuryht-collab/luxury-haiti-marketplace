// Service Worker for Luxury Haiti Marketplace PWA
// Version 1.0.0

const CACHE_NAME = 'luxury-haiti-v1.0.0';
const STATIC_CACHE_NAME = 'luxury-haiti-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'luxury-haiti-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/favicon.ico',
  '/lht-hero.jpg.png',
  '/placeholder.svg',
  '/robots.txt',
  // Add critical CSS and JS files
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// API routes to cache with network-first strategy
const API_ROUTES = [
  '/api/create-bazik-session',
  '/api/payment-callback',
  '/api/verify-payment'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isApiRoute(request)) {
    // API routes - network first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else if (isNavigationRequest(request)) {
    // Navigation requests - network first with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    // Other requests - network first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isApiRoute(request) {
  const url = new URL(request.url);
  return API_ROUTES.some(route => url.pathname.startsWith(route));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Cache first failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed for navigation, serving offline page');
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Luxury Haiti - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #ff6b35, #f7931e);
              color: white;
              text-align: center;
            }
            .offline-container {
              padding: 2rem;
              border-radius: 1rem;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
            }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 2rem; opacity: 0.9; }
            button {
              background: white;
              color: #ff6b35;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: 600;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <h1>🏝️ Luxury Haiti</h1>
            <p>You're currently offline. Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[ServiceWorker] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  // For example, retry failed API calls
  console.log('[ServiceWorker] Performing background sync');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Product',
          icon: '/favicon.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/favicon.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/marketplace')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
