export interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  createdAt: Date
  lastReviewed?: Date
  reviewCount: number
  correctCount: number
  tags: string[]
}

export interface FlashcardSet {
  id: string
  name: string
  description: string
  cards: Flashcard[]
  createdAt: Date
  lastStudied?: Date
  totalStudyTime: number // in minutes
}

export interface StudySession {
  id: string
  setId: string
  startTime: Date
  endTime?: Date
  cardsStudied: number
  correctAnswers: number
  mode: "study" | "quiz"
}

export interface QuizResult {
  cardId: string
  correct: boolean
  timeSpent: number // in seconds
  attempts: number
}

export interface UserProgress {
  totalCardsStudied: number
  totalStudyTime: number
  streakDays: number
  lastStudyDate?: Date
  achievements: string[]
}
