// public/sw.js
const CACHE_NAME = 'galaxy-distance-v1';

// 👇 Более надёжный способ кэширования с обработкой ошибок
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const assets = [
        '/galaxy_distance_frontend/',
        '/galaxy_distance_frontend/manifest.json',
        '/galaxy_distance_frontend/logo192.png',
        '/galaxy_distance_frontend/logo512.png',
      ];

      // 👇 Кэшируем по одному с обработкой ошибок
      for (const url of assets) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
            console.log('✅ Cached:', url);
          }
        } catch (err) {
          console.warn('⚠️ Failed to cache:', url, err);
          // Не прерываем установку, если один файл не закешировался
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// 👇 Базовый обработчик fetch (как в методичке)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});