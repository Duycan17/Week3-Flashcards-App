const CACHE_NAME = "flashlearn-v1"
const STATIC_ASSETS = ["/", "/sets", "/sets/new", "/manifest.json", "/offline.html"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("Service worker installed")
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse
      }

      // Try to fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the response for future use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If network fails, try to serve offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html")
          }

          // For other requests, return a generic offline response
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          })
        })
    }),
  )
})

// Background sync for when connection is restored
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Sync any pending data when connection is restored
      syncPendingData(),
    )
  }
})

async function syncPendingData() {
  try {
    // This would sync any pending changes to a server
    // For now, we just log that sync is happening
    console.log("Syncing pending data...")

    // In a real app, you might:
    // - Send any pending study session data
    // - Upload new flashcards created offline
    // - Sync user progress

    return Promise.resolve()
  } catch (error) {
    console.error("Sync failed:", error)
    throw error
  }
}
