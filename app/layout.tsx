import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlashLearn - Language Learning Flashcards",
  description: "Master vocabulary through interactive flashcards and spaced repetition",
  manifest: "/manifest.json",
  themeColor: "#fafafa",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FlashLearn",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/flashcard-app-icon.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FlashLearn" />
      </head>
      <body className={inter.className}>
        {children}
        <OfflineIndicator />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
