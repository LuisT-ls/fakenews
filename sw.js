const CACHE_NAME = 'fake-news-checker-v2'

// Separar recursos por prioridade
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/manifest.json',
  '/favicon.ico'
]

const SECONDARY_ASSETS = [
  '/assets/js/script.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
]

const DEFERRED_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
]

// Instalação do Service Worker com estratégia de cache priorizado
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache primário para recursos críticos
      caches.open(`${CACHE_NAME}-critical`).then(cache => {
        console.log('Cacheando recursos críticos')
        return cache.addAll(CRITICAL_ASSETS)
      }),
      // Cache secundário para outros recursos
      caches.open(`${CACHE_NAME}-secondary`).then(cache => {
        console.log('Cacheando recursos secundários')
        return cache.addAll(SECONDARY_ASSETS)
      }),
      // Cache para recursos adiados
      caches.open(`${CACHE_NAME}-deferred`).then(cache => {
        console.log('Cacheando recursos adiados')
        return cache.addAll(DEFERRED_ASSETS)
      })
    ]).catch(error => {
      console.error('Erro ao cachear assets:', error)
    })
  )
})

// Ativação com limpeza de cache antigo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.startsWith(CACHE_NAME)) {
            console.log('Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Estratégia de cache otimizada
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Estratégia específica para recursos críticos
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

  // Estratégia para recursos secundários
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

  // Estratégia padrão para outros recursos
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response
      }
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
          caches.open(`${CACHE_NAME}-deferred`).then(cache => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return new Response(
              '<html><body><h1>Offline</h1><p>Por favor, verifique sua conexão.</p></body></html>',
              {
                headers: { 'Content-Type': 'text/html' }
              }
            )
          }
        })
    })
  )
})

// Função auxiliar para fetch e cache
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

// Tratamento de mensagens
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting()
  }
})

// Pré-busca de recursos em segundo plano
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Pré-busca de recursos frequentemente acessados
      fetch('/assets/js/script.js'),
      fetch('/assets/css/styles.css')
    ])
  )
})
