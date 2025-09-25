"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FlashcardSet, Flashcard } from "@/lib/types"
import { getFlashcardSets, addFlashcard, updateFlashcard, deleteFlashcard } from "@/lib/storage"
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react"
import Link from "next/link"

export default function EditSetPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [showNewCardForm, setShowNewCardForm] = useState(false)

  // Form states
  const [cardFront, setCardFront] = useState("")
  const [cardBack, setCardBack] = useState("")
  const [cardCategory, setCardCategory] = useState("")
  const [cardDifficulty, setCardDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [cardTags, setCardTags] = useState("")

  useEffect(() => {
    const sets = getFlashcardSets()
    const set = sets.find((s) => s.id === setId)
    setFlashcardSet(set || null)
    setIsLoading(false)
  }, [setId])

  const resetForm = () => {
    setCardFront("")
    setCardBack("")
    setCardCategory("")
    setCardDifficulty("medium")
    setCardTags("")
    setEditingCard(null)
    setShowNewCardForm(false)
  }

  const handleAddCard = () => {
    if (!flashcardSet || !cardFront.trim() || !cardBack.trim()) return

    const tags = cardTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    addFlashcard(flashcardSet.id, cardFront.trim(), cardBack.trim(), cardCategory.trim(), cardDifficulty, tags)

    // Refresh the set
    const updatedSets = getFlashcardSets()
    const updatedSet = updatedSets.find((s) => s.id === setId)
    setFlashcardSet(updatedSet || null)

    resetForm()
  }

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card)
    setCardFront(card.front)
    setCardBack(card.back)
    setCardCategory(card.category)
    setCardDifficulty(card.difficulty)
    setCardTags(card.tags.join(", "))
    setShowNewCardForm(true)
  }

  const handleUpdateCard = () => {
    if (!flashcardSet || !editingCard || !cardFront.trim() || !cardBack.trim()) return

    const tags = cardTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    updateFlashcard(flashcardSet.id, editingCard.id, {
      front: cardFront.trim(),
      back: cardBack.trim(),
      category: cardCategory.trim(),
      difficulty: cardDifficulty,
      tags,
    })

    // Refresh the set
    const updatedSets = getFlashcardSets()
    const updatedSet = updatedSets.find((s) => s.id === setId)
    setFlashcardSet(updatedSet || null)

    resetForm()
  }

  const handleDeleteCard = (cardId: string) => {
    if (!flashcardSet) return

    deleteFlashcard(flashcardSet.id, cardId)

    // Refresh the set
    const updatedSets = getFlashcardSets()
    const updatedSet = updatedSets.find((s) => s.id === setId)
    setFlashcardSet(updatedSet || null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flashcard set...</p>
        </div>
      </div>
    )
  }

  if (!flashcardSet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Set not found</h2>
          <p className="text-muted-foreground mb-4">The flashcard set you're looking for doesn't exist.</p>
          <Link href="/sets">
            <Button>Back to Sets</Button>
          </Link>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-balance">{flashcardSet.name}</h1>
              <p className="text-muted-foreground">{flashcardSet.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Add/Edit Card Form */}
          {showNewCardForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingCard ? "Edit Card" : "Add New Card"}</CardTitle>
                <CardDescription>
                  {editingCard ? "Update the flashcard details" : "Create a new flashcard for this set"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="front">Front (Question/Term) *</Label>
                    <Textarea
                      id="front"
                      placeholder="Enter the question or term..."
                      value={cardFront}
                      onChange={(e) => setCardFront(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="back">Back (Answer/Definition) *</Label>
                    <Textarea
                      id="back"
                      placeholder="Enter the answer or definition..."
                      value={cardBack}
                      onChange={(e) => setCardBack(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Verbs, Nouns, Grammar"
                      value={cardCategory}
                      onChange={(e) => setCardCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={cardDifficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") => setCardDifficulty(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., basic, conversation, formal"
                      value={cardTags}
                      onChange={(e) => setCardTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={editingCard ? handleUpdateCard : handleAddCard}
                    disabled={!cardFront.trim() || !cardBack.trim()}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {editingCard ? "Update Card" : "Add Card"}
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cards ({flashcardSet.cards.length})</h2>
              {!showNewCardForm && (
                <Button onClick={() => setShowNewCardForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Card
                </Button>
              )}
            </div>

            {flashcardSet.cards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cards yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add your first flashcard to start building this set
                  </p>
                  <Button onClick={() => setShowNewCardForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {flashcardSet.cards.map((card) => (
                  <Card key={card.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Front</Label>
                              <p className="text-sm mt-1">{card.front}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Back</Label>
                              <p className="text-sm mt-1">{card.back}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {card.category && <span>Category: {card.category}</span>}
                            <Badge
                              variant={
                                card.difficulty === "easy"
                                  ? "default"
                                  : card.difficulty === "medium"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {card.difficulty}
                            </Badge>
                            {card.tags.length > 0 && <span>Tags: {card.tags.join(", ")}</span>}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Reviewed {card.reviewCount} times • {card.correctCount} correct
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCard(card)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCard(card.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
