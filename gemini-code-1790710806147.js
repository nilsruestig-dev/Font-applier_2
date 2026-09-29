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
        const formData = await event.request.formData();
        const mediaFile = formData.get('note_image');
        if (mediaFile) {
          const cache = await caches.open('shared-images');
          await cache.put('shared-note', new Response(mediaFile));
        }
        return Response.redirect('./index.html', 303);
      })()
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});