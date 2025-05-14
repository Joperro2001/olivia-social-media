
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { saveCityMatch } from "@/services/cityMatchService";

interface CityMatchQuestionnaireProps {
  onProgress: (percent: number) => void;
  onComplete: (city: string) => void;
}

const questions = [
  {
    id: "climate",
    question: "What type of climate do you prefer?",
    options: ["Warm and sunny", "Four distinct seasons", "Cool and rainy", "Mild all year"]
  },
  {
    id: "pace",
    question: "What pace of life are you looking for?",
    options: ["Fast-paced metropolis", "Medium-sized city", "Laid-back small city", "Quiet town"]
  },
  {
    id: "activities",
    question: "What activities are most important to you?",
    options: ["Arts & Culture", "Outdoor adventures", "Nightlife & Entertainment", "Food & Dining"]
  },
  {
    id: "cost",
    question: "What's your budget preference?",
    options: ["Affordable living", "Moderate cost", "Willing to pay premium for quality of life", "Money is no object"]
  },
  {
    id: "language",
    question: "What language preference do you have?",
    options: ["English only", "Spanish speaking", "French speaking", "Open to learning any language"]
  }
];

// This is a simplified matching algorithm
// In a real app, this would be more sophisticated
const cityMapping = {
  "Warm and sunny": {
    "Fast-paced metropolis": {
      "Arts & Culture": {
        "Willing to pay premium for quality of life": {
          "English only": "New York",
          "Spanish speaking": "Barcelona",
          "French speaking": "Paris", 
          "Open to learning any language": "Tokyo"
        },
        "Money is no object": "London",
        "Moderate cost": "Berlin",
        "Affordable living": "Bangkok"
      },
      "Outdoor adventures": "Sydney",
      "Nightlife & Entertainment": "Miami",
      "Food & Dining": "Singapore"
    },
    "Medium-sized city": "Austin",
    "Laid-back small city": "Lisbon",
    "Quiet town": "Valencia"
  },
  "Four distinct seasons": "Berlin",
  "Cool and rainy": "London",
  "Mild all year": "Barcelona"
};

const CityMatchQuestionnaire: React.FC<CityMatchQuestionnaireProps> = ({ onProgress, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (answer: string) => {
    const question = questions[currentQuestionIndex];
    
    const newAnswers = {
      ...answers,
      [question.id]: answer
    };
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      onProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    } else {
      setIsSubmitting(true);
      onProgress(100);
      
      // Simple logic to determine city match
      // In a real application, this would be more sophisticated
      let matchedCity = "";
      
      // Simplified algorithm to pick a city based on first question primarily
      const climate = newAnswers.climate;
      const pace = newAnswers.pace;
      const activities = newAnswers.activities;
      const cost = newAnswers.cost;
      const language = newAnswers.language;
      
      try {
        if (typeof cityMapping[climate] === "string") {
          matchedCity = cityMapping[climate];
        } else if (typeof cityMapping[climate][pace] === "string") {
          matchedCity = cityMapping[climate][pace];
        } else if (typeof cityMapping[climate][pace][activities] === "string") {
          matchedCity = cityMapping[climate][pace][activities];
        } else if (typeof cityMapping[climate][pace][activities][cost] === "string") {
          matchedCity = cityMapping[climate][pace][activities][cost];
        } else if (cityMapping[climate][pace][activities][cost][language]) {
          matchedCity = cityMapping[climate][pace][activities][cost][language];
        } else {
          // Default cities if path doesn't match fully
          const defaultCities = ["Berlin", "Barcelona", "London", "New York", "Tokyo"];
          matchedCity = defaultCities[Math.floor(Math.random() * defaultCities.length)];
        }
      } catch (error) {
        // Fallback option
        matchedCity = "Barcelona";
      }
      
      try {
        // Save to Supabase
        await saveCityMatch({ 
          city: matchedCity, 
          matchData: newAnswers 
        });
        
        // Notify parent component
        onComplete(matchedCity);
      } catch (error) {
        console.error("Error saving city match:", error);
        toast({
          title: "Error",
          description: "There was an error saving your city match. Your result might not be saved.",
        });
        // Still notify parent component even if saving failed
        onComplete(matchedCity);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
      
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <Button
            key={option}
            variant="outline"
            className="w-full justify-start text-left h-auto py-4 px-4"
            disabled={isSubmitting}
            onClick={() => handleAnswer(option)}
          >
            {option}
          </Button>
        ))}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
    </div>
  );
};

export default CityMatchQuestionnaire;
