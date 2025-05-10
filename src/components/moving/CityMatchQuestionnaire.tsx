
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    cities: string[];
  }[];
}

interface CityMatchQuestionnaireProps {
  onProgress: (progress: number) => void;
  onComplete: (city: string) => void;
}

const questions: Question[] = [
  {
    id: 1,
    text: "What kind of climate do you prefer?",
    options: [
      { id: "warm", text: "Warm and sunny year-round", cities: ["Barcelona", "Miami", "Sydney"] },
      { id: "seasons", text: "Distinct seasons with mild summers", cities: ["Toronto", "Berlin", "Boston"] },
      { id: "cool", text: "Cool and temperate", cities: ["London", "Seattle", "Amsterdam"] },
      { id: "cold", text: "Cold with snowy winters", cities: ["Stockholm", "Montreal", "Oslo"] }
    ]
  },
  {
    id: 2,
    text: "What's your ideal pace of life?",
    options: [
      { id: "busy", text: "Fast-paced and always something happening", cities: ["New York", "Tokyo", "Hong Kong"] },
      { id: "balanced", text: "Balanced with culture and opportunities", cities: ["Berlin", "Barcelona", "Melbourne"] },
      { id: "relaxed", text: "Relaxed but with city amenities", cities: ["Portland", "Copenhagen", "Vienna"] },
      { id: "slow", text: "Slow-paced and peaceful", cities: ["Boulder", "Wellington", "Kyoto"] }
    ]
  },
  {
    id: 3,
    text: "What's most important to you in a city?",
    options: [
      { id: "culture", text: "Arts and cultural experiences", cities: ["Paris", "Rome", "Vienna"] },
      { id: "food", text: "Food scene and nightlife", cities: ["Bangkok", "New Orleans", "Mexico City"] },
      { id: "outdoors", text: "Nature and outdoor activities", cities: ["Vancouver", "Denver", "Cape Town"] },
      { id: "career", text: "Career opportunities and networking", cities: ["San Francisco", "London", "Singapore"] }
    ]
  },
  {
    id: 4,
    text: "How would you describe your personality?",
    options: [
      { id: "adventurous", text: "Adventurous and spontaneous", cities: ["Berlin", "Bangkok", "Melbourne"] },
      { id: "creative", text: "Creative and artistic", cities: ["Paris", "Austin", "Barcelona"] },
      { id: "analytical", text: "Analytical and structured", cities: ["Zurich", "Tokyo", "Munich"] },
      { id: "social", text: "Social and community-oriented", cities: ["Amsterdam", "Dublin", "Stockholm"] }
    ]
  },
  {
    id: 5,
    text: "What's your budget preference?",
    options: [
      { id: "luxury", text: "I'm willing to pay premium for the right location", cities: ["New York", "London", "Hong Kong"] },
      { id: "moderate", text: "Moderate - I want good value", cities: ["Berlin", "Montreal", "Melbourne"] },
      { id: "affordable", text: "Affordable is a priority", cities: ["Lisbon", "Prague", "Bangkok"] },
      { id: "flexible", text: "Flexible - location matters more than cost", cities: ["Barcelona", "Austin", "Amsterdam"] }
    ]
  }
];

const CityMatchQuestionnaire: React.FC<CityMatchQuestionnaireProps> = ({ 
  onProgress, 
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedOption) {
      // Save the answer
      setAnswers({...answers, [currentQuestion]: selectedOption});
      
      // Move to next question or complete
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        
        // Update progress
        const newProgress = ((currentQuestion + 1) / questions.length) * 100;
        onProgress(newProgress);
      } else {
        // Quiz completed
        onProgress(100);
        const matchedCity = calculateCityMatch(answers);
        onComplete(matchedCity);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
      
      // Update progress
      const newProgress = ((currentQuestion - 1) / questions.length) * 100;
      onProgress(newProgress);
    }
  };

  const calculateCityMatch = (userAnswers: Record<number, string>): string => {
    // Simple algorithm to count city votes based on answers
    const cityCounts: Record<string, number> = {};
    
    Object.entries(userAnswers).forEach(([questionIdx, optionId]) => {
      const questionIndex = parseInt(questionIdx, 10);
      const question = questions[questionIndex];
      const selectedOption = question.options.find(opt => opt.id === optionId);
      
      if (selectedOption) {
        selectedOption.cities.forEach(city => {
          cityCounts[city] = (cityCounts[city] || 0) + 1;
        });
      }
    });
    
    // Find the city with the most votes
    let bestCity = "Berlin"; // Default
    let maxVotes = 0;
    
    Object.entries(cityCounts).forEach(([city, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        bestCity = city;
      }
    });
    
    return bestCity;
  };

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{question.text}</h3>
      
      <RadioGroup 
        value={selectedOption || ""}
        onValueChange={setSelectedOption}
        className="space-y-3"
      >
        {question.options.map(option => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedOption}
        >
          {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default CityMatchQuestionnaire;
