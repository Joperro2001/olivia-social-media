
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";

interface SuggestionCardProps {
  title: string;
  description: string;
  image?: string;
  ctaText: string;
  onAction: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  title,
  description,
  image,
  ctaText,
  onAction,
}) => {
  return (
    <Card className="w-[300px] mx-auto my-4 flex-shrink-0 shadow-md border border-gray-100">
      {image && (
        <div className="h-40 overflow-hidden rounded-t-lg">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-app-subtext mt-2 text-sm">{description}</p>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <Button onClick={onAction} className="w-full">
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SuggestionCard;
