
import React from "react";
import { FileCheck, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategoryGrid from "./CategoryGrid";
import { useNavigate } from "react-router-dom";

interface CategoryStats {
  total: number;
  completed: number;
}

interface DocumentCardProps {
  hasChecklist: boolean;
  groupedCategories: Record<string, CategoryStats>;
  onCreateChecklist: () => void;
  onCreateDefaultChecklist?: () => void;
  showDefaultChecklist: boolean;
  navigateToCategory: (category: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  hasChecklist,
  groupedCategories,
  onCreateChecklist,
  onCreateDefaultChecklist,
  showDefaultChecklist,
  navigateToCategory,
}) => {
  const navigate = useNavigate();
  
  // Setup the categories we want to display
  const topCategories = ["Visa", "Health Insurance", "SIM Card"];
  const bottomCategories = hasChecklist
    ? Object.keys(groupedCategories).filter(cat => !topCategories.includes(cat)).slice(0, 3)
    : ["Incoming University Documents", "Home University Documents", "Bank Account"];
  
  return (
    <Card className="border-primary/10 hover:shadow-md transition-shadow animate-fade-in w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {hasChecklist ? 
            <FileCheck className="h-5 w-5 text-primary" /> : 
            <FileText className="h-5 w-5 text-primary" />
          }
          <CardTitle>
            {hasChecklist ? "Your Relocation Documents" : "Relocation Documents"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          {hasChecklist 
            ? "Click on a category to view and manage its documents:" 
            : "Track your essential documents with a structured list:"}
        </p>
        
        <CategoryGrid 
          categories={topCategories} 
          stats={groupedCategories} 
          onCategorySelect={navigateToCategory}
        />
        
        <div className="mt-3">
          <CategoryGrid 
            categories={bottomCategories} 
            stats={groupedCategories} 
            onCategorySelect={navigateToCategory}
            startIndex={3}
          />
        </div>
        
        {hasChecklist ? (
          <div className="flex justify-between mt-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/checklist-detail")} className="hover:shadow-sm transition-shadow">
              View Full Document List
            </Button>
          </div>
        ) : (
          <Button className="w-full mt-6 hover:shadow-md transition-shadow" 
            onClick={showDefaultChecklist ? onCreateDefaultChecklist : onCreateChecklist}>
            Create My Document List
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
