import React from "react";
import SuggestionCard from "./SuggestionCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
  onCardAction
}) => {
  return <div className="w-full py-0">
      <Carousel className="w-full">
        <CarouselContent>
          {suggestions.map(suggestion => <CarouselItem key={suggestion.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <SuggestionCard title={suggestion.title} description={suggestion.description} image={suggestion.image} ctaText={suggestion.ctaText} onAction={() => onCardAction(suggestion.id)} />
              </div>
            </CarouselItem>)}
        </CarouselContent>
        <div className="flex justify-center gap-2 mt-2">
          <CarouselPrevious className="static transform-none mx-1 h-8 w-8" />
          <CarouselNext className="static transform-none mx-1 h-8 w-8" />
        </div>
      </Carousel>
    </div>;
};
export default SuggestionCarousel;