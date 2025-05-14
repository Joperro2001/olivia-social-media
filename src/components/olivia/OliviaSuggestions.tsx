
import React from "react";
import SuggestionCarousel from "./SuggestionCarousel";

interface OliviaSuggestionsProps {
  onCardAction: (id: string) => void;
}

const OliviaSuggestions: React.FC<OliviaSuggestionsProps> = ({ onCardAction }) => {
  const suggestedCards = [
    {
      id: "card1",
      title: "Find Your Perfect City",
      description: "Take our City Match Quiz and discover where you'd thrive!",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=500",
      ctaText: "Start Quiz"
    }, {
      id: "card2",
      title: "Get a Local SIM Card",
      description: "Stay connected with affordable mobile data options.",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=500",
      ctaText: "View Options"
    }, {
      id: "card3",
      title: "Join Group Matches",
      description: "Connect with people who share your interests and goals.",
      image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=500",
      ctaText: "Explore Groups"
    }
  ];

  return <SuggestionCarousel suggestions={suggestedCards} onCardAction={onCardAction} />;
};

export default OliviaSuggestions;
