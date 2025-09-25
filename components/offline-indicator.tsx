"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      // Hide the indicator after 3 seconds when back online
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showIndicator && isOnline) return null

  return (
    <div className="fixed top-4 right-4 z-50 slide-in">
      <Badge variant={isOnline ? "default" : "destructive"} className="gap-2 px-3 py-2">
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        {isOnline ? "Back Online" : "Offline Mode"}
      </Badge>
    </div>
  )
}
