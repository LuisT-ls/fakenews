const CACHE_NAME = 'fake-news-checker-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/script.js',
  '/manifest.json',
  '/favicon.ico',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
]

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto')
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .catch(error => {
        console.error('Erro ao cachear assets:', error)
      })
  )
})

// Ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interceptação de requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna o recurso do cache se existir
      if (response) {
        return response
      }

      // Caso contrário, busca na rede
      return fetch(event.request)
        .then(response => {
          // Verifica se a resposta é válida
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response
          }

          // Clone a resposta
          const responseToCache = response.clone()

          // Adiciona ao cache
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Se falhar, retorna uma página offline personalizada para documentos HTML
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
        })
    })
  )
})

// Tratamento de mensagens
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting()
  }
})
