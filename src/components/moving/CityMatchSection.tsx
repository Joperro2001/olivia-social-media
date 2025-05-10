import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import CityMatchQuestionnaire from "./CityMatchQuestionnaire";
import CityResult from "./CityResult";
const CityMatchSection: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matchedCity, setMatchedCity] = useState<string | null>(null);
  const handleStartQuiz = () => {
    setStarted(true);
  };
  const handleQuizProgress = (percent: number) => {
    setProgress(percent);
  };
  const handleQuizComplete = (city: string) => {
    setMatchedCity(city);
    setCompleted(true);
  };
  const handleReset = () => {
    setStarted(false);
    setCompleted(false);
    setProgress(0);
    setMatchedCity(null);
  };
  return <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>City Match</CardTitle>
        </div>
        <CardDescription>
          Find your perfect city match based on your lifestyle and preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="py-0">
        {!started && !completed && <div className="flex flex-col items-center text-center py-8">
            <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&h=400&q=80" alt="City skyline" className="rounded-lg mb-6 w-full max-w-md object-cover h-48" />
            <p className="mb-6 text-muted-foreground">
              Take our fun questionnaire to discover which city would be your perfect match based on your personality, lifestyle preferences, and goals!
            </p>
            <Button onClick={handleStartQuiz} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Find Your Perfect City
            </Button>
          </div>}
        
        {started && !completed && <>
            <Progress value={progress} className="mb-6" />
            <CityMatchQuestionnaire onProgress={handleQuizProgress} onComplete={handleQuizComplete} />
          </>}
        
        {completed && matchedCity && <CityResult city={matchedCity} onReset={handleReset} />}
      </CardContent>
      
      {(started || completed) && <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="outline" onClick={handleReset}>
            Start Over
          </Button>
        </CardFooter>}
    </Card>;
};
export default CityMatchSection;