
import React from "react";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CityResultProps {
  city: string;
  onReset: () => void;
}

// Map of cities to their images and descriptions
const cityDetails: Record<string, { image: string; description: string }> = {
  "Barcelona": {
    image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=600&h=400&q=80",
    description: "A vibrant Mediterranean city with amazing architecture, beaches, and a relaxed lifestyle. Perfect for creative spirits who enjoy culture, food, and sunny weather."
  },
  "Berlin": {
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&h=400&q=80",
    description: "An affordable creative hub with rich history, diverse neighborhoods, and world-class nightlife. Ideal for artists, entrepreneurs, and those who value work-life balance."
  },
  "New York": {
    image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&h=400&q=80",
    description: "The city that never sleeps offers unparalleled career opportunities, cultural experiences, and diversity. Perfect for ambitious professionals who thrive in fast-paced environments."
  },
  "Tokyo": {
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=600&h=400&q=80",
    description: "A fascinating blend of ultramodern and traditional, with impeccable public transport and food. Ideal for tech enthusiasts and those who appreciate precision and efficiency."
  },
  "London": {
    image: "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?auto=format&fit=crop&w=600&h=400&q=80",
    description: "A global financial and cultural capital with diverse neighborhoods and endless opportunities. Great for career-focused individuals who value history and international connections."
  }
};

// Default fallback city details
const defaultCityDetails = {
  image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&h=400&q=80",
  description: "Based on your preferences, this vibrant city offers the perfect balance of culture, lifestyle, and opportunities that match your personality."
};

const CityResult: React.FC<CityResultProps> = ({ city, onReset }) => {
  const { toast } = useToast();
  const details = cityDetails[city] || defaultCityDetails;

  const handleShare = () => {
    const shareText = `I took the Olivia City Match quiz and found out I belong in ${city}!`;
    
    // In a real app, this would use the Web Share API or a social sharing library
    toast({
      title: "Share Your Result",
      description: "This feature will be available in the full version!",
    });
    
    console.log("User would share:", shareText);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="bg-gradient-to-b from-primary/20 to-accent/10 rounded-full p-6 mb-6">
        <h3 className="text-2xl font-bold text-primary">{city}</h3>
      </div>
      
      <img 
        src={details.image} 
        alt={city} 
        className="rounded-lg mb-6 w-full max-w-md object-cover h-48"
      />
      
      <h3 className="text-xl font-bold mb-2">You belong in {city}!</h3>
      
      <p className="mb-8 text-muted-foreground">
        {details.description}
      </p>
      
      <Button onClick={handleShare} className="gap-2 mb-4">
        <Share className="h-4 w-4" />
        Share Your Result
      </Button>
    </div>
  );
};

export default CityResult;
