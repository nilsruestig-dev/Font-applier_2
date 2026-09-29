self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Hilfsfunktion: Speichert die empfangene Datei sicher in der IndexedDB
function storeFileInIDB(fileBlob) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SharedNotesDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.put(fileBlob, 'pendingNote');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          let sharedFile = null;

          // Durchsucht alle hochgeladenen Formularfelder nach der Datei
          for (const value of formData.values()) {
            if (value && typeof value === 'object' && value.size > 0) {
              sharedFile = value;
              break;
            }
          }

          if (sharedFile) {
            await storeFileInIDB(sharedFile);
          }
        } catch (err) {
          console.error("SW Share Error:", err);
        }

        // Leitet auf die Hauptseite weiter
        return Response.redirect('./index.html?shared=true', 303);
      })()
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
