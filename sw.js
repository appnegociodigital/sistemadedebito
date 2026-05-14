const CACHE_NAME = 'debitos-v2';
const FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instala e armazena os arquivos em cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES).catch(function() {
        return cache.add('./index.html');
      });
    })
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// NETWORK FIRST: tenta a rede, usa cache só se offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      // Atualiza o cache com a versão mais recente
      var respClone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, respClone);
      });
      return response;
    }).catch(function() {
      // Sem internet: usa cache
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
