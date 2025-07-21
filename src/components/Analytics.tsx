import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { Trophy, Target, Clock, TrendingUp, Brain, Calendar } from "lucide-react";

interface StudySession {
  id: string;
  started_at: string;
  ended_at: string;
  total_cards_studied: number;
  correct_answers: number;
  incorrect_answers: number;
  decks: {
    title: string;
  };
}

interface DeckPerformance {
  deck_title: string;
  total_sessions: number;
  total_cards: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy: number;
}

interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  total_study_days: number;
}

const Analytics = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [deckPerformance, setDeckPerformance] = useState<DeckPerformance[]>([]);
  const [studyStreak, setStudyStreak] = useState<StudyStreak>({
    current_streak: 0,
    longest_streak: 0,
    total_study_days: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch study sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("study_sessions")
        .select(`
          *,
          decks (
            title
          )
        `)
        .eq("user_id", user?.id)
        .not("ended_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Calculate deck performance
      const deckStats = new Map<string, any>();
      sessionsData?.forEach(session => {
        const deckTitle = session.decks?.title || "Unknown";
        if (!deckStats.has(deckTitle)) {
          deckStats.set(deckTitle, {
            deck_title: deckTitle,
            total_sessions: 0,
            total_cards: 0,
            correct_answers: 0,
            incorrect_answers: 0,
          });
        }
        const stats = deckStats.get(deckTitle);
        stats.total_sessions += 1;
        stats.total_cards += session.total_cards_studied;
        stats.correct_answers += session.correct_answers;
        stats.incorrect_answers += session.incorrect_answers;
      });

      const deckPerformanceData = Array.from(deckStats.values()).map(stats => ({
        ...stats,
        accuracy: stats.total_cards > 0 
          ? Math.round((stats.correct_answers / (stats.correct_answers + stats.incorrect_answers)) * 100)
          : 0,
      }));

      setDeckPerformance(deckPerformanceData);

      // Calculate study streak
      const studyDates = [...new Set(
        sessionsData?.map(session => 
          new Date(session.started_at).toDateString()
        ) || []
      )].sort();

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calculate current streak from today backwards
      const today = new Date();
      for (let i = 0; i >= -30; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateString = checkDate.toDateString();
        
        if (studyDates.includes(dateString)) {
          if (i === 0 || i === -1) { // Today or yesterday
            currentStreak++;
          }
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i === 0) currentStreak = 0; // No study today
          tempStreak = 0;
        }
      }

      setStudyStreak({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_study_days: studyDates.length,
      });

    } catch (error: any) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSessions = sessions.length;
  const totalCards = sessions.reduce((sum, s) => sum + s.total_cards_studied, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_answers, 0);
  const totalIncorrect = sessions.reduce((sum, s) => sum + s.incorrect_answers, 0);
  const overallAccuracy = totalCards > 0 ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) : 0;
  const avgSessionTime = sessions.length > 0 
    ? sessions.reduce((sum, s) => {
        const duration = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime();
        return sum + duration;
      }, 0) / sessions.length / 1000 / 60 // Convert to minutes
    : 0;

  // Chart data
  const dailyActivityData = sessions
    .slice(0, 7)
    .reverse()
    .map(session => ({
      date: new Date(session.started_at).toLocaleDateString(),
      sessions: 1,
      accuracy: Math.round((session.correct_answers / (session.correct_answers + session.incorrect_answers)) * 100),
    }));

  const accuracyData = [
    { name: "Correct", value: totalCorrect, color: "#22c55e" },
    { name: "Incorrect", value: totalIncorrect, color: "#ef4444" },
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Learning Analytics</h2>
        <p className="text-muted-foreground">
          Track your progress and performance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Accuracy</p>
                <p className="text-2xl font-bold">{overallAccuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{studyStreak.current_streak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{Math.round(avgSessionTime)}</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Your study sessions over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Answer Distribution</CardTitle>
                <CardDescription>Correct vs incorrect answers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accuracyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {accuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {accuracyData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deck Performance</CardTitle>
              <CardDescription>Your performance across different decks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deckPerformance.map((deck, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{deck.deck_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {deck.total_sessions} sessions • {deck.total_cards} cards
                        </p>
                      </div>
                      <Badge variant={deck.accuracy >= 80 ? "default" : deck.accuracy >= 60 ? "secondary" : "destructive"}>
                        {deck.accuracy}%
                      </Badge>
                    </div>
                    <Progress value={deck.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="font-semibold mb-2">Study Streak</h3>
                <p className="text-2xl font-bold">{studyStreak.current_streak}</p>
                <p className="text-sm text-muted-foreground">Current streak</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Longest: {studyStreak.longest_streak} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Cards Mastered</h3>
                <p className="text-2xl font-bold">{totalCorrect}</p>
                <p className="text-sm text-muted-foreground">Correct answers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Study Days</h3>
                <p className="text-2xl font-bold">{studyStreak.total_study_days}</p>
                <p className="text-sm text-muted-foreground">Total active days</p>
              </CardContent>
            </Card>
          </div>

          {sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your last 10 study sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{session.decks?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {Math.round((session.correct_answers / (session.correct_answers + session.incorrect_answers)) * 100)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.correct_answers}/{session.correct_answers + session.incorrect_answers}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;