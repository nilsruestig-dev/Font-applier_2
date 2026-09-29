// Version 2.0 - Erzwingt Aktualisierung im Browser
const CACHE_NAME = 'shared-images-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          let mediaFile = null;

          // Sucht nach der ersten Datei in den gesendeten Formulardaten
          for (const entry of formData.values()) {
            if (entry && typeof entry === 'object' && entry.name) {
              mediaFile = entry;
              break;
            }
          }

          if (mediaFile) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('shared-note', new Response(mediaFile));
          }
        } catch (e) {
          console.error('Share processing error:', e);
        }
        
        // Leitet zurück zur App weiter
        return Response.redirect('./index.html?shared=true', 303);
      })()
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
