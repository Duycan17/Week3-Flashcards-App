"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createFlashcardSet } from "@/lib/storage"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewSetPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)

    try {
      const newSet = createFlashcardSet(name.trim(), description.trim())
      router.push(`/sets/${newSet.id}/edit`)
    } catch (error) {
      console.error("Failed to create flashcard set:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/sets">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-balance">Create New Set</h1>
              <p className="text-muted-foreground">Start building your vocabulary collection</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Set Details</CardTitle>
              <CardDescription>Give your flashcard set a name and description to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Set Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Spanish Basics, French Verbs, Medical Terms"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this set covers and who it's for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={!name.trim() || isCreating} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isCreating ? "Creating..." : "Create Set"}
                  </Button>
                  <Link href="/sets">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
