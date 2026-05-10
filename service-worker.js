// Service Worker for PWA
const CACHE_NAME = '4chill-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/register.html',
    '/dashboard.html',
    '/calendar.html',
    '/css/styles.css',
    '/js/db.js',
    '/js/app.js',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/calendar.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Enforce HTTPS
    if (event.request.url.startsWith('http://') && !event.request.url.includes('localhost')) {
        event.respondWith(Response.redirect(event.request.url.replace('http://', 'https://'), 301));
        return;
    }

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip API requests – always fetch from network
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Add security headers to cached responses
                    return addSecurityHeaders(response);
                }

                return fetch(event.request).then(response => {
                    // Don't cache if not successful
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return addSecurityHeaders(response);
                });
            })
            .catch(() => {
                // Return a custom offline page if needed
                // caches.match('/offline.html');
            })
    );
});

// Add security headers to responses
function addSecurityHeaders(response) {
    const headers = new Headers(response.headers);
    
    // Add security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
}
