const CACHE_NAME = 'fake-news-checker-v2'
const OFFLINE_URL = '/pages/offline.html'

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/manifest.json',
  '/favicon.ico',
  OFFLINE_URL
]

const SECONDARY_ASSETS = [
  '/assets/js/script.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
]

const DEFERRED_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
]

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(`${CACHE_NAME}-critical`).then(cache => {
        console.log('Cacheando recursos críticos')
        return cache.addAll(CRITICAL_ASSETS)
      }),
      caches.open(`${CACHE_NAME}-secondary`).then(cache => {
        console.log('Cacheando recursos secundários')
        return cache.addAll(SECONDARY_ASSETS)
      }),
      caches.open(`${CACHE_NAME}-deferred`).then(cache => {
        console.log('Cacheando recursos adiados')
        return cache.addAll(DEFERRED_ASSETS)
      })
    ]).catch(error => {
      console.error('Erro ao cachear assets:', error)
    })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.startsWith(CACHE_NAME)) {
              console.log('Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim(),
      fetch('/assets/js/script.js'),
      fetch('/assets/css/styles.css')
    ])
  )
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL) || caches.match('/')
      })
    )
    return
  }

  // Critical assets strategy
  if (CRITICAL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches
        .match(event.request, { cacheName: `${CACHE_NAME}-critical` })
        .then(
          response =>
            response || fetchAndCache(event.request, `${CACHE_NAME}-critical`)
        )
    )
    return
  }

  // Secondary assets strategy
  if (SECONDARY_ASSETS.some(asset => url.href.includes(asset))) {
    event.respondWith(
      caches
        .match(event.request)
        .then(
          response =>
            response || fetchAndCache(event.request, `${CACHE_NAME}-secondary`)
        )
    )
    return
  }

  // Default strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response

      return fetch(event.request)
        .then(response => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response
          }

          const responseToCache = response.clone()
          caches
            .open(`${CACHE_NAME}-deferred`)
            .then(cache => cache.put(event.request, responseToCache))

          return response
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
    })
  )
})

function fetchAndCache(request, cacheName) {
  return fetch(request).then(response => {
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response
    }

    const responseToCache = response.clone()
    caches.open(cacheName).then(cache => cache.put(request, responseToCache))

    return response
  })
}

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting()
  }
})
