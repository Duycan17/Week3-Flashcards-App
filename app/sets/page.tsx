"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { FlashcardSet } from "@/lib/types"
import { getFlashcardSets } from "@/lib/storage"
import { BookOpen, Plus, Search, Edit, Play, Brain } from "lucide-react"
import Link from "next/link"

export default function SetsPage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setFlashcardSets(getFlashcardSets())
    setIsLoading(false)
  }, [])

  const filteredSets = flashcardSets.filter(
    (set) =>
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your flashcard sets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-balance">Flashcard Sets</h1>
              <p className="text-muted-foreground">Manage your vocabulary collections</p>
            </div>
            <Link href="/sets/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Set
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flashcard sets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sets Grid */}
        {filteredSets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{searchQuery ? "No sets found" : "No flashcard sets yet"}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Create your first flashcard set to start learning"}
              </p>
              {!searchQuery && (
                <Link href="/sets/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Set
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((set) => {
              const progress =
                set.cards.length > 0
                  ? Math.round((set.cards.filter((card) => card.correctCount > 0).length / set.cards.length) * 100)
                  : 0

              return (
                <Card key={set.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg text-balance">{set.name}</CardTitle>
                        <CardDescription className="text-pretty">{set.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{set.cards.length}</Badge>
                        <Link href={`/sets/${set.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/study/${set.id}`} className="flex-1">
                        <Button className="w-full gap-2" size="sm">
                          <Play className="h-4 w-4" />
                          Study
                        </Button>
                      </Link>
                      <Link href={`/quiz/${set.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                          <Brain className="h-4 w-4" />
                          Quiz
                        </Button>
                      </Link>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created {set.createdAt.toLocaleDateString()}
                      {set.lastStudied && (
                        <span className="block">Last studied {set.lastStudied.toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
