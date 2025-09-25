"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { FlashcardSet, StudySession } from "@/lib/types"
import { getFlashcardSets, updateFlashcard, saveStudySession, updateUserProgress, getUserProgress } from "@/lib/storage"
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Eye, EyeOff, SkipForward } from "lucide-react"
import Link from "next/link"

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studySession, setStudySession] = useState<StudySession | null>(null)
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const sets = getFlashcardSets()
    const set = sets.find((s) => s.id === setId)

    if (set && set.cards.length > 0) {
      setFlashcardSet(set)
      // Start study session
      const session: StudySession = {
        id: crypto.randomUUID(),
        setId: set.id,
        startTime: new Date(),
        cardsStudied: 0,
        correctAnswers: 0,
        mode: "study",
      }
      setStudySession(session)
    }

    setIsLoading(false)
  }, [setId])

  const currentCard = flashcardSet?.cards[currentCardIndex]
  const progress = flashcardSet ? ((currentCardIndex + 1) / flashcardSet.cards.length) * 100 : 0

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setShowAnswer(!showAnswer)
  }

  const handleAnswer = (correct: boolean) => {
    if (!currentCard || !flashcardSet || !studySession) return

    // Update card statistics
    updateFlashcard(flashcardSet.id, currentCard.id, {
      reviewCount: currentCard.reviewCount + 1,
      correctCount: currentCard.correctCount + (correct ? 1 : 0),
      lastReviewed: new Date(),
    })

    // Update session stats
    const newStats = {
      correct: sessionStats.correct + (correct ? 1 : 0),
      incorrect: sessionStats.incorrect + (correct ? 0 : 1),
    }
    setSessionStats(newStats)

    // Move to next card or complete session
    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    } else {
      completeSession(newStats)
    }
  }

  const handleSkip = () => {
    if (!flashcardSet) return

    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    } else {
      completeSession(sessionStats)
    }
  }

  const completeSession = (finalStats: { correct: number; incorrect: number }) => {
    if (!studySession || !flashcardSet) return

    const endTime = new Date()
    const sessionDuration = Math.round((endTime.getTime() - studySession.startTime.getTime()) / 1000 / 60) // minutes

    // Update and save session
    const completedSession: StudySession = {
      ...studySession,
      endTime,
      cardsStudied: flashcardSet.cards.length,
      correctAnswers: finalStats.correct,
    }
    saveStudySession(completedSession)

    // Update user progress
    const currentProgress = getUserProgress()
    const today = new Date().toDateString()
    const lastStudyDate = currentProgress.lastStudyDate?.toDateString()
    const isNewDay = lastStudyDate !== today

    updateUserProgress({
      totalCardsStudied: currentProgress.totalCardsStudied + flashcardSet.cards.length,
      totalStudyTime: currentProgress.totalStudyTime + sessionDuration,
      streakDays: isNewDay ? currentProgress.streakDays + 1 : currentProgress.streakDays,
      lastStudyDate: new Date(),
    })

    setIsComplete(true)
  }

  const resetSession = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
    setIsComplete(false)

    if (flashcardSet) {
      const session: StudySession = {
        id: crypto.randomUUID(),
        setId: flashcardSet.id,
        startTime: new Date(),
        cardsStudied: 0,
        correctAnswers: 0,
        mode: "study",
      }
      setStudySession(session)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading study session...</p>
        </div>
      </div>
    )
  }

  if (!flashcardSet || flashcardSet.cards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No cards to study</h2>
          <p className="text-muted-foreground mb-4">This set doesn't have any flashcards yet.</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/sets/${setId}/edit`}>
              <Button>Add Cards</Button>
            </Link>
            <Link href="/sets">
              <Button variant="outline">Back to Sets</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isComplete) {
    const accuracy = Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)

    return (
      <div className="min-h-screen bg-background">
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
                <h1 className="text-2xl font-bold text-balance">Study Complete!</h1>
                <p className="text-muted-foreground">{flashcardSet.name}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h2 className="text-2xl font-bold">Great job!</h2>
                  <p className="text-muted-foreground">You've completed this study session</p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{sessionStats.correct}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{sessionStats.incorrect}</div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{accuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={resetSession} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Study Again
                  </Button>
                  <Link href={`/quiz/${setId}`}>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      Take Quiz
                    </Button>
                  </Link>
                  <Link href="/sets">
                    <Button variant="outline" className="bg-transparent">
                      Back to Sets
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sets">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-balance">{flashcardSet.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Card {currentCardIndex + 1} of {flashcardSet.cards.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Session Progress</div>
              <div className="text-sm font-medium">
                {sessionStats.correct} correct • {sessionStats.incorrect} incorrect
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Flashcard */}
          <div className="relative">
            <Card
              className={`min-h-[300px] cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isFlipped ? "flip-animation" : ""
              }`}
              onClick={handleFlip}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                {!showAnswer ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">{currentCard?.category || "General"}</Badge>
                      <Badge
                        variant={
                          currentCard?.difficulty === "easy"
                            ? "default"
                            : currentCard?.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {currentCard?.difficulty}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <Eye className="h-8 w-8 text-muted-foreground mx-auto" />
                      <h2 className="text-2xl font-bold text-balance">{currentCard?.front}</h2>
                      <p className="text-muted-foreground">Click to reveal answer</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">{currentCard?.category || "General"}</Badge>
                      <Badge
                        variant={
                          currentCard?.difficulty === "easy"
                            ? "default"
                            : currentCard?.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {currentCard?.difficulty}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <EyeOff className="h-8 w-8 text-muted-foreground mx-auto" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{currentCard?.front}</p>
                        <h2 className="text-2xl font-bold text-balance">{currentCard?.back}</h2>
                      </div>
                      {currentCard?.tags && currentCard.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {currentCard.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {!showAnswer ? (
              <Button onClick={handleFlip} size="lg" className="w-full gap-2">
                <Eye className="h-4 w-4" />
                Show Answer
              </Button>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                >
                  <XCircle className="h-4 w-4" />
                  Incorrect
                </Button>
                <Button onClick={handleSkip} variant="outline" size="lg" className="gap-2 bg-transparent">
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  variant="outline"
                  size="lg"
                  className="gap-2 text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                >
                  <CheckCircle className="h-4 w-4" />
                  Correct
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Reviewed {currentCard?.reviewCount || 0} times • {currentCard?.correctCount || 0} correct
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
