"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { FlashcardSet, UserProgress } from "@/lib/types"
import { getFlashcardSets, getUserProgress, initializeSampleData } from "@/lib/storage"
import { BookOpen, Brain, Trophy, Plus, Play, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize sample data and load user data
    initializeSampleData()
    setFlashcardSets(getFlashcardSets())
    setUserProgress(getUserProgress())
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your flashcards...</p>
        </div>
      </div>
    )
  }

  const totalCards = flashcardSets.reduce((sum, set) => sum + set.cards.length, 0)
  const studiedToday = userProgress?.lastStudyDate?.toDateString() === new Date().toDateString()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">FlashLearn</h1>
                <p className="text-sm text-muted-foreground">Master vocabulary through spaced repetition</p>
              </div>
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
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-xs text-muted-foreground">Across {flashcardSets.length} sets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.streakDays || 0}</div>
              <p className="text-xs text-muted-foreground">{studiedToday ? "Studied today!" : "Keep it up!"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.totalCardsStudied || 0}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((userProgress?.totalStudyTime || 0) / 60)} hours studied
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard Sets */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-balance">Your Flashcard Sets</h2>
            <Link href="/sets">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {flashcardSets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No flashcard sets yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first flashcard set to start learning
                </p>
                <Link href="/sets/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Set
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcardSets.map((set) => {
                const progress =
                  set.cards.length > 0
                    ? Math.round((set.cards.filter((card) => card.correctCount > 0).length / set.cards.length) * 100)
                    : 0

                return (
                  <Card key={set.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-balance">{set.name}</CardTitle>
                          <CardDescription className="text-pretty">{set.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{set.cards.length} cards</Badge>
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
