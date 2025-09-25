// Offline functionality utilities

export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js")
    console.log("Service Worker registered:", registration)

    // Listen for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New content is available, prompt user to refresh
            if (confirm("New version available! Refresh to update?")) {
              window.location.reload()
            }
          }
        })
      }
    })
  } catch (error) {
    console.error("Service Worker registration failed:", error)
  }
}

export const isOnline = (): boolean => {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

export const requestPersistentStorage = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("storage" in navigator) || !("persist" in navigator.storage)) {
    return false
  }

  try {
    const persistent = await navigator.storage.persist()
    console.log("Persistent storage:", persistent)
    return persistent
  } catch (error) {
    console.error("Failed to request persistent storage:", error)
    return false
  }
}

export const getStorageEstimate = async (): Promise<StorageEstimate | null> => {
  if (typeof window === "undefined" || !("storage" in navigator) || !("estimate" in navigator.storage)) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    console.log("Storage estimate:", estimate)
    return estimate
  } catch (error) {
    console.error("Failed to get storage estimate:", error)
    return null
  }
}

// Queue system for offline actions
interface OfflineAction {
  id: string
  type: string
  data: any
  timestamp: number
}

const OFFLINE_QUEUE_KEY = "offline_action_queue"

export const queueOfflineAction = (type: string, data: any): void => {
  if (typeof window === "undefined") return

  const action: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    data,
    timestamp: Date.now(),
  }

  const queue = getOfflineQueue()
  queue.push(action)
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

export const getOfflineQueue = (): OfflineAction[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const clearOfflineQueue = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}

export const processOfflineQueue = async (): Promise<void> => {
  const queue = getOfflineQueue()
  if (queue.length === 0) return

  console.log(`Processing ${queue.length} offline actions...`)

  // Process each queued action
  for (const action of queue) {
    try {
      await processOfflineAction(action)
    } catch (error) {
      console.error("Failed to process offline action:", action, error)
    }
  }

  // Clear the queue after processing
  clearOfflineQueue()
}

const processOfflineAction = async (action: OfflineAction): Promise<void> => {
  // In a real app, this would sync with a server
  // For now, we just log the action
  console.log("Processing offline action:", action)

  switch (action.type) {
    case "CREATE_FLASHCARD_SET":
      // Sync new flashcard set to server
      break
    case "UPDATE_FLASHCARD":
      // Sync flashcard updates to server
      break
    case "STUDY_SESSION":
      // Sync study session data to server
      break
    default:
      console.warn("Unknown offline action type:", action.type)
  }
}
