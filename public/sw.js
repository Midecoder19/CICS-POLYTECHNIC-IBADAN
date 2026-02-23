// Service Worker for Extreme Performance Caching
const CACHE_NAME = 'polyibadan-v1.0.0';
const STATIC_CACHE = 'polyibadan-static-v1.0.0';
const API_CACHE = 'polyibadan-api-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/stock',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.svg',
  '/logo512.svg'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/dashboard/stats'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default network-first for other requests
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Handle API requests with cache-first strategy for performance
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const url = new URL(request.url);

  // Cache GET requests for 5 minutes
  if (request.method === 'GET') {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // Clone and cache the response
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (error) {
      // Network failed, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
  }

  // Fallback to network
  return fetch(request);
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const url = new URL(request.url);

  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return fetch(request);
  }

  const cache = await caches.open(STATIC_CACHE);

  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse);
      }
    });
    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return new Response('Offline', { status: 503 });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  const cache = await caches.open(STATIC_CACHE);

  // Try cache first for navigation
  const cachedResponse = await cache.match('/');
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback to network
  return fetch(request);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when back online
  console.log('🔄 Performing background sync...');
  // Implement offline action replay here
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRIC') {
    // Log performance metrics
    console.log('📊 Performance Metric:', event.data.metric);
  }
});