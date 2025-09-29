// Service Worker for RecallLens
const CACHE_NAME = 'recalllens-v1';
const DATA_CACHE_NAME = 'recalllens-data-v1';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle data requests
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                console.log('Serving data from cache:', url.pathname);
                return response;
              }
              
              return fetch(request)
                .then((networkResponse) => {
                  if (networkResponse.ok) {
                    console.log('Caching data:', url.pathname);
                    cache.put(request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // Return cached data even if stale
                  return cache.match(request);
                });
            });
        })
    );
    return;
  }
  
  // Handle static assets
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('Serving from cache:', url.pathname);
            return response;
          }
          
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                console.log('Caching:', url.pathname);
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              // Return offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/');
              }
            });
        })
    );
  }
});

// Background sync for data updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'data-sync') {
    console.log('Background sync: updating recall data');
    event.waitUntil(updateRecallData());
  }
});

// Update recall data in background
async function updateRecallData() {
  try {
    const response = await fetch('/data/latest.json');
    if (response.ok) {
      const data = await response.json();
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put('/data/latest.json', response);
      console.log('Recall data updated:', data.date);
    }
  } catch (error) {
    console.error('Failed to update recall data:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'recall-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
