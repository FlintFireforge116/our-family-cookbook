const CACHE = 'family-cookbook-v3'
const SHELL = [
  './','./index.html','./styles.css','./config.js','./manifest.webmanifest',
  './src/app.js','./src/domain/recipes.js','./src/domain/week.js','./src/domain/image.js',
  './src/data/indexedDbRepository.js','./src/data/firebaseRepository.js','./src/data/backup.js',
  './src/ui/icons.js','./src/ui/views.js','./assets/icon-192.png','./assets/icon-512.png'
]
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())))
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())))
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response
  }).catch(() => caches.match('./index.html'))))
})
