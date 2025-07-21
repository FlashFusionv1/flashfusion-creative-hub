import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, BookOpen, Users, Lock, Edit, Trash2, Eye } from "lucide-react";

interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  total_cards: number;
  is_public: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string;
  };
}

interface DeckManagerProps {
  onStudyDeck?: (deckId: string) => void;
  onEditDeck?: (deckId: string) => void;
}

const CATEGORIES = [
  "Education", "Language", "Science", "Technology", "Business", 
  "History", "Art", "Music", "Sports", "Other"
];

const DeckManager = ({ onStudyDeck, onEditDeck }: DeckManagerProps) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [viewMode, setViewMode] = useState<"my" | "public">("my");
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    is_public: false,
  });

  useEffect(() => {
    if (user) {
      fetchDecks();
    }
  }, [user, viewMode]);

  const fetchDecks = async () => {
    try {
      let query = supabase
        .from("decks")
        .select("*");

      if (viewMode === "my") {
        query = query.eq("user_id", user?.id);
      } else {
        query = query.eq("is_public", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setDecks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch decks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeck = async () => {
    try {
      if (editingDeck) {
        const { error } = await supabase
          .from("decks")
          .update(formData)
          .eq("id", editingDeck.id);

        if (error) throw error;
        toast({ title: "Success", description: "Deck updated successfully" });
      } else {
        const { error } = await supabase
          .from("decks")
          .insert([{ ...formData, user_id: user?.id }]);

        if (error) throw error;
        toast({ title: "Success", description: "Deck created successfully" });
      }

      setShowCreateDialog(false);
      setEditingDeck(null);
      setFormData({ title: "", description: "", category: "", is_public: false });
      fetchDecks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", deckId);

      if (error) throw error;
      toast({ title: "Success", description: "Deck deleted successfully" });
      fetchDecks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete deck",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (deck: Deck) => {
    setEditingDeck(deck);
    setFormData({
      title: deck.title,
      description: deck.description || "",
      category: deck.category || "",
      is_public: deck.is_public,
    });
    setShowCreateDialog(true);
  };

  const openCreateDialog = () => {
    setEditingDeck(null);
    setFormData({ title: "", description: "", category: "", is_public: false });
    setShowCreateDialog(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading decks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Flashcard Decks</h2>
          <p className="text-muted-foreground">
            Manage your flashcard collections
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: "my" | "public") => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="my">My Decks</SelectItem>
              <SelectItem value="public">Public Decks</SelectItem>
            </SelectContent>
          </Select>
          {viewMode === "my" && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Deck
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Card key={deck.id} className="relative group">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{deck.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {deck.description || "No description"}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {deck.is_public ? (
                    <Users className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{deck.category || "Uncategorized"}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {deck.total_cards} cards
                  </span>
                </div>


                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onStudyDeck?.(deck.id)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Study
                  </Button>
                  {deck.user_id === user?.id && viewMode === "my" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditDeck?.(deck.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {viewMode === "public" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onStudyDeck?.(deck.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {decks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            {viewMode === "my" ? "No decks yet" : "No public decks available"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {viewMode === "my" 
              ? "Create your first flashcard deck to get started"
              : "Check back later for public decks from other users"
            }
          </p>
          {viewMode === "my" && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Deck
            </Button>
          )}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDeck ? "Edit Deck" : "Create New Deck"}
            </DialogTitle>
            <DialogDescription>
              {editingDeck 
                ? "Update your deck information" 
                : "Create a new flashcard deck to organize your learning"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Deck title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this deck covers"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_public">Make this deck public</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDeck} disabled={!formData.title.trim()}>
                {editingDeck ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeckManager;