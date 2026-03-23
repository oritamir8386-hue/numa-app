/* ═══════════════════════════════════════════
   Numa Service Worker v1.0
   עודכן: אוטומטי עם כל דפלוי
═══════════════════════════════════════════ */

const CACHE_NAME = 'numa-v5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
];

// ── INSTALL: שמור assets בסיסיים
self.addEventListener('install', event => {
  console.log('[Numa SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { mode: 'no-cors' })))
        .catch(err => console.log('[Numa SW] Cache partial fail (ok):', err));
    })
  );
  self.skipWaiting(); // הפעל מיד ללא המתנה
});

// ── ACTIVATE: נקה caches ישנים
self.addEventListener('activate', event => {
  console.log('[Numa SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[Numa SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim(); // קח שליטה על כל הטאבים מיד
});

// ── FETCH: Network First + Cache Fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // דלג על בקשות שאינן GET
  if (request.method !== 'GET') return;

  // דלג על Supabase ו-API calls — תמיד רשת
  if (url.hostname.includes('supabase') || url.pathname.includes('/api/')) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // שמור עותק ב-cache אם זה תגובה תקינה
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // ללא אינטרנט — תחזיר מה-cache
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // אם אין — תחזיר את הדף הראשי
          return caches.match('./index.html');
        });
      })
  );
});

// ── MESSAGE: האזן להודעות מהאפליקציה
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── PUSH: התראות (לעתיד)
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Numa', {
    body: data.body || '',
    icon: './icons/icon-192.png',
    badge: './icons/icon-72.png',
    dir: 'rtl',
    lang: 'he',
    data: { url: data.url || './' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
