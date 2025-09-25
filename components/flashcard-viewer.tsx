"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Flashcard } from "@/lib/types"
import { Eye, EyeOff, RotateCcw } from "lucide-react"

interface FlashcardViewerProps {
  card: Flashcard
  onAnswer?: (correct: boolean) => void
  showAnswerButtons?: boolean
  className?: string
}

export function FlashcardViewer({ card, onAnswer, showAnswerButtons = false, className = "" }: FlashcardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setShowAnswer(!showAnswer)
  }

  const handleReset = () => {
    setIsFlipped(false)
    setShowAnswer(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
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
                <Badge variant="outline">{card.category || "General"}</Badge>
                <Badge
                  variant={
                    card.difficulty === "easy" ? "default" : card.difficulty === "medium" ? "secondary" : "destructive"
                  }
                >
                  {card.difficulty}
                </Badge>
              </div>
              <div className="space-y-4">
                <Eye className="h-8 w-8 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-bold text-balance">{card.front}</h2>
                <p className="text-muted-foreground">Click to reveal answer</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{card.category || "General"}</Badge>
                <Badge
                  variant={
                    card.difficulty === "easy" ? "default" : card.difficulty === "medium" ? "secondary" : "destructive"
                  }
                >
                  {card.difficulty}
                </Badge>
              </div>
              <div className="space-y-4">
                <EyeOff className="h-8 w-8 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{card.front}</p>
                  <h2 className="text-2xl font-bold text-balance">{card.back}</h2>
                </div>
                {card.tags && card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {card.tags.map((tag) => (
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

      <div className="flex gap-2 justify-center">
        <Button onClick={handleFlip} variant="outline" size="sm" className="gap-2 bg-transparent">
          {showAnswer ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm" className="gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {showAnswerButtons && showAnswer && onAnswer && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onAnswer(false)}
            variant="outline"
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          >
            Incorrect
          </Button>
          <Button
            onClick={() => onAnswer(true)}
            variant="outline"
            className="gap-2 text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
          >
            Correct
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Reviewed {card.reviewCount} times • {card.correctCount} correct
        </p>
      </div>
    </div>
  )
}
