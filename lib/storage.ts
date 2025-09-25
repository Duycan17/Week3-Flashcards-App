import type { Flashcard, FlashcardSet, StudySession, UserProgress } from "./types"

const STORAGE_KEYS = {
  FLASHCARD_SETS: "flashcard_sets",
  STUDY_SESSIONS: "study_sessions",
  USER_PROGRESS: "user_progress",
} as const

// Flashcard Sets Management
export const getFlashcardSets = (): FlashcardSet[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEYS.FLASHCARD_SETS)
  if (!stored) return []

  try {
    const sets = JSON.parse(stored)
    return sets.map((set: any) => ({
      ...set,
      createdAt: new Date(set.createdAt),
      lastStudied: set.lastStudied ? new Date(set.lastStudied) : undefined,
      cards: set.cards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
      })),
    }))
  } catch {
    return []
  }
}

export const saveFlashcardSets = (sets: FlashcardSet[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.FLASHCARD_SETS, JSON.stringify(sets))
}

export const createFlashcardSet = (name: string, description: string): FlashcardSet => {
  const newSet: FlashcardSet = {
    id: crypto.randomUUID(),
    name,
    description,
    cards: [],
    createdAt: new Date(),
    totalStudyTime: 0,
  }

  const sets = getFlashcardSets()
  sets.push(newSet)
  saveFlashcardSets(sets)

  return newSet
}

export const addFlashcard = (
  setId: string,
  front: string,
  back: string,
  category: string,
  difficulty: "easy" | "medium" | "hard",
  tags: string[] = [],
): Flashcard => {
  const newCard: Flashcard = {
    id: crypto.randomUUID(),
    front,
    back,
    category,
    difficulty,
    createdAt: new Date(),
    reviewCount: 0,
    correctCount: 0,
    tags,
  }

  const sets = getFlashcardSets()
  const setIndex = sets.findIndex((set) => set.id === setId)

  if (setIndex !== -1) {
    sets[setIndex].cards.push(newCard)
    saveFlashcardSets(sets)
  }

  return newCard
}

export const updateFlashcard = (setId: string, cardId: string, updates: Partial<Flashcard>): void => {
  const sets = getFlashcardSets()
  const setIndex = sets.findIndex((set) => set.id === setId)

  if (setIndex !== -1) {
    const cardIndex = sets[setIndex].cards.findIndex((card) => card.id === cardId)
    if (cardIndex !== -1) {
      sets[setIndex].cards[cardIndex] = { ...sets[setIndex].cards[cardIndex], ...updates }
      saveFlashcardSets(sets)
    }
  }
}

export const deleteFlashcard = (setId: string, cardId: string): void => {
  const sets = getFlashcardSets()
  const setIndex = sets.findIndex((set) => set.id === setId)

  if (setIndex !== -1) {
    sets[setIndex].cards = sets[setIndex].cards.filter((card) => card.id !== cardId)
    saveFlashcardSets(sets)
  }
}

// Study Sessions Management
export const getStudySessions = (): StudySession[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS)
  if (!stored) return []

  try {
    const sessions = JSON.parse(stored)
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
    }))
  } catch {
    return []
  }
}

export const saveStudySession = (session: StudySession): void => {
  if (typeof window === "undefined") return

  const sessions = getStudySessions()
  const existingIndex = sessions.findIndex((s) => s.id === session.id)

  if (existingIndex !== -1) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }

  localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions))
}

// User Progress Management
export const getUserProgress = (): UserProgress => {
  if (typeof window === "undefined") {
    return {
      totalCardsStudied: 0,
      totalStudyTime: 0,
      streakDays: 0,
      achievements: [],
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)
  if (!stored) {
    return {
      totalCardsStudied: 0,
      totalStudyTime: 0,
      streakDays: 0,
      achievements: [],
    }
  }

  try {
    const progress = JSON.parse(stored)
    return {
      ...progress,
      lastStudyDate: progress.lastStudyDate ? new Date(progress.lastStudyDate) : undefined,
    }
  } catch {
    return {
      totalCardsStudied: 0,
      totalStudyTime: 0,
      streakDays: 0,
      achievements: [],
    }
  }
}

export const updateUserProgress = (updates: Partial<UserProgress>): void => {
  if (typeof window === "undefined") return

  const currentProgress = getUserProgress()
  const updatedProgress = { ...currentProgress, ...updates }

  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(updatedProgress))
}

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  const sets = getFlashcardSets()

  if (sets.length === 0) {
    const sampleSet = createFlashcardSet("Spanish Basics", "Essential Spanish vocabulary for beginners")

    // Add sample flashcards
    addFlashcard(sampleSet.id, "Hello", "Hola", "Greetings", "easy", ["basic", "greeting"])
    addFlashcard(sampleSet.id, "Goodbye", "Adiós", "Greetings", "easy", ["basic", "greeting"])
    addFlashcard(sampleSet.id, "Thank you", "Gracias", "Politeness", "easy", ["basic", "polite"])
    addFlashcard(sampleSet.id, "Please", "Por favor", "Politeness", "easy", ["basic", "polite"])
    addFlashcard(sampleSet.id, "How are you?", "¿Cómo estás?", "Questions", "medium", ["question", "conversation"])
    addFlashcard(sampleSet.id, "I am fine", "Estoy bien", "Responses", "medium", ["response", "conversation"])
    addFlashcard(sampleSet.id, "What is your name?", "¿Cómo te llamas?", "Questions", "medium", [
      "question",
      "introduction",
    ])
    addFlashcard(sampleSet.id, "My name is...", "Me llamo...", "Responses", "medium", ["response", "introduction"])
  }
}
