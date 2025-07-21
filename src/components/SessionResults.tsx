import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, RotateCcw, ArrowLeft } from "lucide-react";

interface SessionResults {
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionTime: number;
}

interface SessionResultsProps {
  results: SessionResults;
  deckTitle: string;
  onRestart: () => void;
  onBack: () => void;
}

const SessionResultsComponent = ({ results, deckTitle, onRestart, onBack }: SessionResultsProps) => {
  const accuracy = Math.round((results.correctAnswers / results.totalCards) * 100);
  const minutes = Math.floor(results.sessionTime / 60);
  const seconds = results.sessionTime % 60;

  const getPerformanceBadge = (accuracy: number) => {
    if (accuracy >= 90) return { variant: "default" as const, text: "Excellent!", color: "text-green-600" };
    if (accuracy >= 80) return { variant: "secondary" as const, text: "Great!", color: "text-blue-600" };
    if (accuracy >= 70) return { variant: "secondary" as const, text: "Good", color: "text-yellow-600" };
    return { variant: "destructive" as const, text: "Keep Practicing", color: "text-red-600" };
  };

  const performance = getPerformanceBadge(accuracy);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Trophy className={`h-16 w-16 ${performance.color}`} />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
          <p className="text-muted-foreground">{deckTitle}</p>
        </div>
        <Badge variant={performance.variant} className="text-lg px-4 py-1">
          {performance.text}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-3 text-primary" />
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <div className="text-2xl font-bold">{results.correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <div className="text-2xl font-bold">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">Time</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
          <CardDescription>Your performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Cards</span>
              <span className="font-medium">{results.totalCards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Correct Answers</span>
              <span className="font-medium text-green-600">{results.correctAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Incorrect Answers</span>
              <span className="font-medium text-red-600">{results.incorrectAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Study Time</span>
              <span className="font-medium">
                {minutes > 0 && `${minutes}m `}{seconds}s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Average per Card</span>
              <span className="font-medium">
                {Math.round(results.sessionTime / results.totalCards)}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Decks
        </Button>
        <Button onClick={onRestart}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Study Again
        </Button>
      </div>

      {accuracy < 70 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Keep Practicing!</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Try studying this deck again to improve your accuracy. Focus on the cards you got wrong.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {accuracy >= 90 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Outstanding Performance!</h4>
                <p className="text-sm text-green-700 mt-1">
                  You've mastered this deck! Consider creating more challenging content or exploring new topics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionResultsComponent;