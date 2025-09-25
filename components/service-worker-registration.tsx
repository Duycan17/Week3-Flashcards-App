"use client"

import { useEffect } from "react"
import { registerServiceWorker, requestPersistentStorage, processOfflineQueue } from "@/lib/offline"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker()

    // Request persistent storage
    requestPersistentStorage()

    // Process any queued offline actions when coming back online
    const handleOnline = () => {
      processOfflineQueue()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return null
}
