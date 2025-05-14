
import React from "react";
import CategoryCard from "./CategoryCard";

interface CategoryStats {
  total: number;
  completed: number;
}

interface CategoryGridProps {
  categories: string[];
  stats: Record<string, CategoryStats>;
  onCategorySelect: (category: string) => void;
  startIndex?: number;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  stats,
  onCategorySelect,
  startIndex = 0
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 mx-auto max-w-md">
      {categories.map((category, index) => {
        const categoryStats = stats[category] || { total: 0, completed: 0 };
        return (
          <CategoryCard
            key={category}
            category={category}
            itemCount={categoryStats.total}
            completedCount={categoryStats.completed}
            onClick={() => onCategorySelect(category)}
            index={startIndex + index}
          />
        );
      })}
    </div>
  );
};

export default CategoryGrid;
