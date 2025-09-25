"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { FlashcardSet, StudySession, Flashcard } from "@/lib/types"
import { getFlashcardSets, updateFlashcard, saveStudySession, updateUserProgress, getUserProgress } from "@/lib/storage"
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, RotateCcw, Target } from "lucide-react"
import Link from "next/link"

interface QuizQuestion {
  card: Flashcard
  options: string[]
  correctAnswer: string
  userAnswer?: string
  timeSpent: number
  isCorrect?: boolean
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [studySession, setStudySession] = useState<StudySession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds per question

  useEffect(() => {
    const sets = getFlashcardSets()
    const set = sets.find((s) => s.id === setId)

    if (set && set.cards.length > 0) {
      setFlashcardSet(set)
      generateQuizQuestions(set)

      // Start quiz session
      const session: StudySession = {
        id: crypto.randomUUID(),
        setId: set.id,
        startTime: new Date(),
        cardsStudied: 0,
        correctAnswers: 0,
        mode: "quiz",
      }
      setStudySession(session)
      setQuizStartTime(new Date())
      setQuestionStartTime(new Date())
    }

    setIsLoading(false)
  }, [setId])

  // Timer effect
  useEffect(() => {
    if (!questionStartTime || showResults || isComplete) return

    const timer = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
      const remaining = Math.max(0, 30 - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        handleTimeUp()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [questionStartTime, showResults, isComplete])

  const generateQuizQuestions = (set: FlashcardSet) => {
    const shuffledCards = [...set.cards].sort(() => Math.random() - 0.5)
    const quizQuestions: QuizQuestion[] = shuffledCards.map((card) => {
      // Generate wrong answers from other cards
      const otherCards = set.cards.filter((c) => c.id !== card.id)
      const wrongAnswers = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => c.back)

      // Combine correct and wrong answers, then shuffle
      const allOptions = [card.back, ...wrongAnswers].sort(() => Math.random() - 0.5)

      return {
        card,
        options: allOptions,
        correctAnswer: card.back,
        timeSpent: 0,
      }
    })

    setQuestions(quizQuestions)
  }

  const handleTimeUp = () => {
    if (selectedAnswer) {
      handleAnswerSubmit()
    } else {
      // Auto-submit with no answer
      handleAnswerSubmit()
    }
  }

  const handleAnswerSubmit = () => {
    if (!questionStartTime) return

    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    // Update question with user's answer
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedAnswer,
      timeSpent,
      isCorrect,
    }
    setQuestions(updatedQuestions)

    // Update card statistics
    if (flashcardSet) {
      updateFlashcard(flashcardSet.id, currentQuestion.card.id, {
        reviewCount: currentQuestion.card.reviewCount + 1,
        correctCount: currentQuestion.card.correctCount + (isCorrect ? 1 : 0),
        lastReviewed: new Date(),
      })
    }

    setShowResults(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
      setShowResults(false)
      setQuestionStartTime(new Date())
      setTimeLeft(30)
    } else {
      completeQuiz()
    }
  }

  const completeQuiz = () => {
    if (!studySession || !flashcardSet || !quizStartTime) return

    const endTime = new Date()
    const totalTime = Math.round((endTime.getTime() - quizStartTime.getTime()) / 1000 / 60) // minutes
    const correctAnswers = questions.filter((q) => q.isCorrect).length

    // Update and save session
    const completedSession: StudySession = {
      ...studySession,
      endTime,
      cardsStudied: questions.length,
      correctAnswers,
    }
    saveStudySession(completedSession)

    // Update user progress
    const currentProgress = getUserProgress()
    const today = new Date().toDateString()
    const lastStudyDate = currentProgress.lastStudyDate?.toDateString()
    const isNewDay = lastStudyDate !== today

    updateUserProgress({
      totalCardsStudied: currentProgress.totalCardsStudied + questions.length,
      totalStudyTime: currentProgress.totalStudyTime + totalTime,
      streakDays: isNewDay ? currentProgress.streakDays + 1 : currentProgress.streakDays,
      lastStudyDate: new Date(),
    })

    setIsComplete(true)
  }

  const resetQuiz = () => {
    if (!flashcardSet) return

    generateQuizQuestions(flashcardSet)
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setShowResults(false)
    setIsComplete(false)
    setQuizStartTime(new Date())
    setQuestionStartTime(new Date())
    setTimeLeft(30)

    const session: StudySession = {
      id: crypto.randomUUID(),
      setId: flashcardSet.id,
      startTime: new Date(),
      cardsStudied: 0,
      correctAnswers: 0,
      mode: "quiz",
    }
    setStudySession(session)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!flashcardSet || flashcardSet.cards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No cards available</h2>
          <p className="text-muted-foreground mb-4">This set doesn't have enough cards for a quiz.</p>
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
    const correctAnswers = questions.filter((q) => q.isCorrect).length
    const accuracy = Math.round((correctAnswers / questions.length) * 100)
    const totalTime = questions.reduce((sum, q) => sum + q.timeSpent, 0)
    const averageTime = Math.round(totalTime / questions.length)

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
                <h1 className="text-2xl font-bold text-balance">Quiz Complete!</h1>
                <p className="text-muted-foreground">{flashcardSet.name}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Results Summary */}
            <Card>
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-2">
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                  <h2 className="text-2xl font-bold">Quiz Results</h2>
                  <p className="text-muted-foreground">Here's how you performed</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{correctAnswers}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">{questions.length - correctAnswers}</div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{accuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{averageTime}s</div>
                    <div className="text-sm text-muted-foreground">Avg Time</div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={resetQuiz} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                  <Link href={`/study/${setId}`}>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      Study Mode
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

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Question Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.card.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Question {index + 1}</span>
                        {question.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{question.timeSpent}s</div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">{question.card.front}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Your answer: </span>
                          <span
                            className={question.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                          >
                            {question.userAnswer || "No answer"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="text-green-600 font-medium">{question.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

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
                <h1 className="text-xl font-bold text-balance">{flashcardSet.name} - Quiz</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeLeft <= 10 ? "text-red-500 font-bold" : ""}>{timeLeft}s</span>
              </div>
              <Badge variant="outline">
                <Target className="h-3 w-3 mr-1" />
                Quiz Mode
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentQuestion?.card.category || "General"}</Badge>
                  <Badge
                    variant={
                      currentQuestion?.card.difficulty === "easy"
                        ? "default"
                        : currentQuestion?.card.difficulty === "medium"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {currentQuestion?.card.difficulty}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(((30 - timeLeft) / 30) * 100)}% time used
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-balance mb-4">{currentQuestion?.card.front}</h2>
                <p className="text-muted-foreground">Select the correct answer:</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      selectedAnswer === option ? "" : "bg-transparent"
                    } ${
                      showResults
                        ? option === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50 text-green-700"
                          : selectedAnswer === option && option !== currentQuestion.correctAnswer
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "opacity-50"
                        : ""
                    }`}
                    onClick={() => !showResults && setSelectedAnswer(option)}
                    disabled={showResults}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-pretty">{option}</span>
                      {showResults && option === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                      {showResults && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!showResults ? (
                  <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer} className="flex-1" size="lg">
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} className="flex-1" size="lg">
                    {currentQuestionIndex < questions.length - 1 ? "Next Question" : "View Results"}
                  </Button>
                )}
              </div>

              {showResults && (
                <div className="text-center text-sm">
                  {currentQuestion?.isCorrect ? (
                    <p className="text-green-600 font-medium">Correct! Well done.</p>
                  ) : (
                    <p className="text-red-600 font-medium">
                      Incorrect. The correct answer is "{currentQuestion?.correctAnswer}".
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
