import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Trophy, Clock } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty_level: number;
}

interface Deck {
  id: string;
  title: string;
}

interface StudySessionProps {
  deckId: string;
  onComplete: (results: SessionResults) => void;
  onBack: () => void;
}

interface SessionResults {
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionTime: number;
}

const StudySession = ({ deckId, onComplete, onBack }: StudySessionProps) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState({
    correct: 0,
    incorrect: 0,
    responses: [] as Array<{ cardId: string; isCorrect: boolean; responseTime: number }>,
  });
  const [loading, setLoading] = useState(true);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (deckId && user) {
      initializeSession();
    }
  }, [deckId, user]);

  const initializeSession = async () => {
    try {
      // Fetch deck
      const { data: deckData, error: deckError } = await supabase
        .from("decks")
        .select("id, title")
        .eq("id", deckId)
        .single();

      if (deckError) throw deckError;
      setDeck(deckData);

      // Fetch flashcards
      const { data: cardsData, error: cardsError } = await supabase
        .from("flashcards")
        .select("id, question, answer, difficulty_level")
        .eq("deck_id", deckId)
        .order("card_order", { ascending: true });

      if (cardsError) throw cardsError;
      
      if (!cardsData || cardsData.length === 0) {
        toast({
          title: "No flashcards",
          description: "This deck doesn't have any flashcards yet.",
          variant: "destructive",
        });
        onBack();
        return;
      }

      setFlashcards(cardsData);

      // Create study session
      const { data: sessionData, error: sessionError } = await supabase
        .from("study_sessions")
        .insert([{
          user_id: user?.id,
          deck_id: deckId,
          total_cards_studied: cardsData.length,
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(sessionData.id);
      setCardStartTime(Date.now());
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to initialize study session",
        variant: "destructive",
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    const responseTime = Date.now() - cardStartTime;
    const currentCard = flashcards[currentCardIndex];

    // Record performance
    try {
      await supabase
        .from("flashcard_performance")
        .insert([{
          user_id: user?.id,
          flashcard_id: currentCard.id,
          session_id: sessionId,
          is_correct: isCorrect,
          response_time_ms: responseTime,
        }]);
    } catch (error) {
      console.error("Error recording performance:", error);
    }

    // Update results
    const newResults = {
      ...results,
      correct: results.correct + (isCorrect ? 1 : 0),
      incorrect: results.incorrect + (isCorrect ? 0 : 1),
      responses: [...results.responses, { 
        cardId: currentCard.id, 
        isCorrect, 
        responseTime 
      }],
    };
    setResults(newResults);

    // Move to next card or complete session
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setCardStartTime(Date.now());
    } else {
      await completeSession(newResults);
    }
  };

  const completeSession = async (finalResults: typeof results) => {
    try {
      const sessionTime = Math.floor((Date.now() - startTime) / 1000);
      
      // Update session
      await supabase
        .from("study_sessions")
        .update({
          ended_at: new Date().toISOString(),
          correct_answers: finalResults.correct,
          incorrect_answers: finalResults.incorrect,
        })
        .eq("id", sessionId);

      const sessionResults: SessionResults = {
        totalCards: flashcards.length,
        correctAnswers: finalResults.correct,
        incorrectAnswers: finalResults.incorrect,
        sessionTime,
      };

      onComplete(sessionResults);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save session results",
        variant: "destructive",
      });
    }
  };

  const resetCard = () => {
    setShowAnswer(false);
    setCardStartTime(Date.now());
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading study session...</div>;
  }

  if (!flashcards.length) {
    return <div className="flex justify-center p-8">No flashcards found</div>;
  }

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + (showAnswer ? 0.5 : 0)) / flashcards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{deck?.title}</h2>
            <p className="text-muted-foreground">
              Card {currentCardIndex + 1} of {flashcards.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {Math.floor((Date.now() - startTime) / 1000)}s
          </Badge>
          <div className="text-sm">
            <span className="text-green-600">{results.correct} correct</span>
            {" • "}
            <span className="text-red-600">{results.incorrect} incorrect</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Flashcard */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {showAnswer ? "Answer" : "Question"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Difficulty: {currentCard.difficulty_level}/5
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetCard}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="text-lg leading-relaxed max-w-2xl">
              {showAnswer ? currentCard.answer : currentCard.question}
            </div>
            
            {!showAnswer ? (
              <Button onClick={() => setShowAnswer(true)} size="lg">
                Show Answer
              </Button>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Incorrect
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Correct
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{results.correct}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{results.incorrect}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {results.correct + results.incorrect > 0 
                ? Math.round((results.correct / (results.correct + results.incorrect)) * 100)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudySession;