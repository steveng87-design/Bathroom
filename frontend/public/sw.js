// Service Worker for Bathroom Quote Saver.AI PWA
// Enables offline functionality and app-like experience

const CACHE_NAME = 'bathroom-quote-saver-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for cost adjustments (AI learning)
self.addEventListener('sync', function(event) {
  if (event.tag === 'cost-adjustment-sync') {
    event.waitUntil(syncCostAdjustments());
  }
});

async function syncCostAdjustments() {
  // Sync pending cost adjustments when back online
  try {
    const adjustments = await getStoredAdjustments();
    for (const adjustment of adjustments) {
      await fetch('/api/quotes/' + adjustment.quote_id + '/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustment)
      });
    }
    await clearStoredAdjustments();
  } catch (error) {
    console.log('Sync failed, will retry later');
  }
}

async function getStoredAdjustments() {
  // Implementation for retrieving stored adjustments
  return [];
}

async function clearStoredAdjustments() {
  // Implementation for clearing synced adjustments
}