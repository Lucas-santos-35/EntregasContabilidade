// Nome do cache para controlo de versões
const CACHE_NAME = 'monttiro-logistica-v1';

// Lista de ficheiros que devem ser guardados para funcionamento offline
const ASSETS_TO_CACHE = [
  'entregas.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Evento de Instalação: Guarda os ficheiros no cache do navegador
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberto: a guardar recursos estáticos');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Força o Service Worker a tornar-se ativo imediatamente
  self.skipWaiting();
});

// Evento de Ativação: Limpa caches antigos se houver mudança de versão
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('A remover cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento Fetch: Tenta obter da rede; se falhar (offline), procura no cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, devolve-a
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tenta encontrar no cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Caso não haja cache e seja uma navegação de página, retorna o index
          if (event.request.mode === 'navigate') {
            return caches.match('entregas.html');
          }
        });
      })
  );
});
