
import React from "react";
import { Button } from "@/components/ui/button";

const PremiumCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary p-5 rounded-2xl text-white shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
          <p className="text-sm opacity-90 mt-1">
            Get unlimited matches and premium features
          </p>
        </div>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <Button className="mt-4 w-full bg-white text-primary hover:bg-white/90 font-medium">
        Upgrade Now
      </Button>
    </div>
  );
};

export default PremiumCard;
