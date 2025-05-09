
import React, { useRef } from "react";
import SuggestionCard from "./SuggestionCard";

interface SuggestionCarouselProps {
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    image?: string;
    ctaText: string;
  }>;
  onCardAction: (id: string) => void;
}

const SuggestionCarousel: React.FC<SuggestionCarouselProps> = ({
  suggestions,
  onCardAction,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full py-2">
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-none gap-3 pb-2 pt-1 snap-x snap-mandatory"
      >
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="snap-start">
            <SuggestionCard
              title={suggestion.title}
              description={suggestion.description}
              image={suggestion.image}
              ctaText={suggestion.ctaText}
              onAction={() => onCardAction(suggestion.id)}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-1 gap-1">
        {suggestions.map((suggestion, index) => (
          <div
            key={`indicator-${suggestion.id}`}
            className="w-1.5 h-1.5 rounded-full bg-gray-300"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionCarousel;
