
import React from "react";
import { Check } from "lucide-react";

interface CategoryCardProps {
  category: string;
  itemCount: number;
  completedCount: number;
  onClick: () => void;
  index?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  itemCount, 
  completedCount,
  onClick,
  index = 0
}) => {
  const percentage = itemCount > 0 ? Math.round(completedCount / itemCount * 100) : 0;
  const isComplete = completedCount > 0 && completedCount === itemCount;
  
  return (
    <div 
      className="opacity-0 animate-fade-in"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div 
        className="border rounded-lg p-3 bg-white flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer transform hover:scale-[1.02] transition-transform duration-200 aspect-square w-full h-28" 
        onClick={onClick} 
        role="button" 
        aria-label={`View ${category} documents`}
      >
        <div className="w-full flex items-center justify-center mb-2">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isComplete ? "bg-primary/10" : "border-2 border-dashed border-primary/40"}`}>
            {isComplete ? 
              <Check className="h-5 w-5 text-primary" /> : 
              <span className="text-xs font-medium text-primary/80">{completedCount}/{itemCount}</span>
            }
          </div>
        </div>
        <p className="text-sm font-medium truncate w-full">{category}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate w-full">
          {itemCount === 0 ? "Required documents" : `${percentage}% complete`}
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;
