import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, Brain, ArrowLeft } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty_level: number;
  card_order: number;
  deck_id: string;
}

interface Deck {
  id: string;
  title: string;
  total_cards: number;
}

interface FlashcardEditorProps {
  deckId?: string;
  onBack?: () => void;
}

const FlashcardEditor = ({ deckId, onBack }: FlashcardEditorProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    difficulty_level: 1,
  });

  useEffect(() => {
    if (deckId && user) {
      fetchDeckAndCards();
    }
  }, [deckId, user]);

  const fetchDeckAndCards = async () => {
    try {
      // Fetch deck info
      const { data: deckData, error: deckError } = await supabase
        .from("decks")
        .select("id, title, total_cards")
        .eq("id", deckId)
        .eq("user_id", user?.id)
        .single();

      if (deckError) throw deckError;
      setDeck(deckData);

      // Fetch flashcards
      const { data: cardsData, error: cardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("card_order", { ascending: true });

      if (cardsError) throw cardsError;
      setFlashcards(cardsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch flashcards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async () => {
    try {
      if (editingCard) {
        const { error } = await supabase
          .from("flashcards")
          .update(formData)
          .eq("id", editingCard.id);

        if (error) throw error;
        toast({ title: "Success", description: "Flashcard updated successfully" });
      } else {
        const { error } = await supabase
          .from("flashcards")
          .insert([{ 
            ...formData, 
            deck_id: deckId,
            card_order: flashcards.length + 1
          }]);

        if (error) throw error;
        toast({ title: "Success", description: "Flashcard created successfully" });
      }

      setShowCreateDialog(false);
      setEditingCard(null);
      setFormData({ question: "", answer: "", difficulty_level: 1 });
      fetchDeckAndCards();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;
      toast({ title: "Success", description: "Flashcard deleted successfully" });
      fetchDeckAndCards();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete flashcard",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      question: card.question,
      answer: card.answer,
      difficulty_level: card.difficulty_level,
    });
    setShowCreateDialog(true);
  };

  const openCreateDialog = () => {
    setEditingCard(null);
    setFormData({ question: "", answer: "", difficulty_level: 1 });
    setShowCreateDialog(true);
  };

  const generateFlashcardWithAI = async () => {
    try {
      const response = await supabase.functions.invoke('generate-flashcard', {
        body: { deckTitle: deck?.title || "General" }
      });

      if (response.error) throw response.error;

      const aiCard = response.data;
      setFormData({
        question: aiCard.question,
        answer: aiCard.answer,
        difficulty_level: aiCard.difficulty || 1,
      });
      setShowCreateDialog(true);
      
      toast({
        title: "AI Flashcard Generated!",
        description: "Review and customize the generated flashcard",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate AI flashcard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading flashcards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{deck?.title}</h2>
          <p className="text-muted-foreground">
            {flashcards.length} flashcards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateFlashcardWithAI}>
            <Brain className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((card, index) => (
          <Card key={card.id} className="group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">Card #{index + 1}</CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">QUESTION</Label>
                  <p className="text-sm mt-1">{card.question}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">ANSWER</Label>
                  <p className="text-sm mt-1">{card.answer}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Difficulty: {card.difficulty_level}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {flashcards.length === 0 && (
        <div className="text-center py-12">
          <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first flashcard to get started
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={generateFlashcardWithAI} variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Edit Flashcard" : "Create New Flashcard"}
            </DialogTitle>
            <DialogDescription>
              {editingCard 
                ? "Update your flashcard content" 
                : "Add a new flashcard to your deck"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter the question or prompt"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer or explanation"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select 
                value={formData.difficulty_level.toString()} 
                onValueChange={(value) => setFormData({ ...formData, difficulty_level: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Easy</SelectItem>
                  <SelectItem value="2">2 - Easy</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Hard</SelectItem>
                  <SelectItem value="5">5 - Very Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCard} 
                disabled={!formData.question.trim() || !formData.answer.trim()}
              >
                {editingCard ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardEditor;