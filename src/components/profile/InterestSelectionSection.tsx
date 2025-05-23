
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { interestOptions } from "@/data/interestOptions";

interface InterestSelectionSectionProps {
  selectedInterests: string[];
  setSelectedInterests: React.Dispatch<React.SetStateAction<string[]>>;
  maxInterests: number;
}

const InterestSelectionSection: React.FC<InterestSelectionSectionProps> = ({ 
  selectedInterests, 
  setSelectedInterests,
  maxInterests 
}) => {
  const { toast } = useToast();

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        // Only add if we haven't reached the maximum
        if (prev.length < maxInterests) {
          return [...prev, interest];
        }
        // Show toast notification if max limit reached
        toast({
          title: `Maximum of ${maxInterests} interests allowed`,
          description: `Please remove an interest before adding a new one.`,
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border space-y-4">
      <h3 className="font-semibold text-lg">Interests</h3>
      <p className="text-sm text-gray-500 mb-3">
        Select up to {maxInterests} interests from the options below to help us match you with like-minded people
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedInterests.length > 0 ? (
          selectedInterests.map((interest) => (
            <Badge 
              key={interest}
              variant="secondary" 
              className="bg-lavender-light text-primary-dark flex items-center"
            >
              {interest}
              <button 
                className="ml-1 hover:text-red-500 transition-colors"
                onClick={() => handleInterestToggle(interest)}
                aria-label={`Remove ${interest} interest`}
              >
                &times;
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-gray-500">No interests selected yet. Choose what you're passionate about!</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {interestOptions.map((interest) => (
          <div 
            key={interest} 
            className="flex items-center space-x-2"
          >
            <Checkbox 
              id={`interest-${interest}`} 
              checked={selectedInterests.includes(interest)}
              onCheckedChange={() => handleInterestToggle(interest)}
              disabled={!selectedInterests.includes(interest) && selectedInterests.length >= maxInterests}
            />
            <label 
              htmlFor={`interest-${interest}`}
              className={`text-sm cursor-pointer ${
                !selectedInterests.includes(interest) && selectedInterests.length >= maxInterests 
                  ? "text-gray-400" 
                  : ""
              }`}
            >
              {interest}
            </label>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          {selectedInterests.length} of {maxInterests} interests selected
        </p>
      </div>
    </div>
  );
};

export default InterestSelectionSection;
