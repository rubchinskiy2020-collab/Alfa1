const CACHE_NAME = 'alfa-calc-v2';
const ASSETS = [
  'index.html',
  'manifest.json'
];

// Установка: Принудительно загоняем файлы в кэш
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Активация: Стираем старые версии кэша, если они были
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия перехвата запросов: Сначала КЭШ. Если сети нет, черный экран не появится.
self.addEventListener('fetch', (event) => {
  // Нам нужно обрабатывать только GET запросы локальных ресурсов
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Локальные файлы отдаем СРАЗУ из кэша (работает в глубоком офлайне)
        return cachedResponse;
      }
      
      // Если запрошено что-то внешнее (например, иконка Альфы из интернета)
      return fetch(event.request).catch(() => {
        // Если интернета нет и иконка упала — страхуем, отдавая главный экран
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});