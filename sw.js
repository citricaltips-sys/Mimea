const CACHE_NAME = 'mimeahub-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/scan.html',
  '/history.html',
  '/analytics.html',
  '/map.html',
  '/market.html',
  '/admin.html',
  '/styles.css',
  '/app.js',
  '/auth.js',
  '/chat.js',
  '/map.js',
  '/market.js',
  '/admin.js',
  '/analytics.js',
  '/history.js',
  '/landing.js',
  '/pdf.js',
  '/remedies.js',
  '/supabase-client.js',
  '/db.js',
  '/model/model.json',
  '/model/metadata.json'
];

const API_CACHE = 'mimeahub-api-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(key => key !== CACHE_NAME && key !== API_CACHE)
        .map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== self.location.origin) {
    if (isExternalAsset(url.pathname)) {
      event.respondWith(cacheFirst(request));
      return;
    }
    event.respondWith(fetch(request));
    return;
  }

  if (isApiRequest(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

function isStaticAsset(pathname) {
  return pathname.match(/\.(css|js|json|png|jpg|svg|ico|woff2?|bin|txt)$/);
}

function isApiRequest(pathname) {
  return pathname.includes('/rest/') || 
         pathname.includes('/auth/') || 
         pathname.includes('/storage/') ||
         pathname.includes('supabase');
}

function isExternalAsset(pathname) {
  return pathname.includes('openstreetmap.org') ||
         pathname.includes('tile.openstreetmap.org') ||
         pathname.includes('cdn.jsdelivr.net') ||
         pathname.includes('unpkg.com');
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    if (request.mode === 'navigate') {
      return cached;
    }
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    return new Response(
      JSON.stringify({ error: 'offline', message: 'You are currently offline' }),
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scans') {
    event.waitUntil(self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'SYNC_SCANS' }));
    }));
  }
  if (event.tag === 'sync-outbreaks') {
    event.waitUntil(self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'SYNC_OUTBREAKS' }));
    }));
  }
  if (event.tag === 'sync-prices') {
    event.waitUntil(self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'SYNC_PRICES' }));
    }));
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
