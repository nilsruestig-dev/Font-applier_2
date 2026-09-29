self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fängt Dateien ab, die über das Android-Teilen-Menü gesendet werden
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const mediaFile = formData.get('note_image');

          if (mediaFile) {
            const cache = await caches.open('shared-images');
            await cache.put('shared-note', new Response(mediaFile));
          }
        } catch (e) {
          console.error('Service Worker Share Error:', e);
        }
        // Leitet sauber zur App weiter
        return Response.redirect('./index.html?shared=true', 303);
      })()
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
