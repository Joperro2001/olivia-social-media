
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useChecklist } from "@/utils/checklistUtils";
import { useAuth } from "@/context/AuthContext";
import { useCategoryChecklist } from "@/hooks/useCategoryChecklist";
import DocumentCard from "./DocumentCard";

const ChecklistList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { syncLocalChecklistToDatabase } = useChecklist();
  const { 
    checklist,
    loading,
    isCreatingChecklist,
    showDefaultChecklist,
    groupedCategories,
    loadChecklist,
    handleCreateChecklist,
    handleCreateDefaultChecklist,
    handleDeletedChecklist
  } = useCategoryChecklist();
  
  const navigateToCategory = (category: string) => {
    // Navigate to the category page even if there might not be items yet
    // The category page will handle the empty state
    navigate(`/checklist-category/${encodeURIComponent(category)}`);
  };

  // Sync local storage checklist to database on initial load if user is logged in
  useEffect(() => {
    if (user) {
      const syncAndLoad = async () => {
        const syncedChecklist = await syncLocalChecklistToDatabase();
        loadChecklist();
        if (syncedChecklist) {
          // The toast is moved to the hook for better code organization
        }
      };
      syncAndLoad();
    }
  }, [user, syncLocalChecklistToDatabase, loadChecklist]);
  
  if (loading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center">
        <Spinner size="lg" className="text-primary" />
        <p className="mt-4 text-muted-foreground">
          {isCreatingChecklist ? "Creating your document list..." : "Loading your documents..."}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <DocumentCard
        hasChecklist={!!checklist}
        groupedCategories={groupedCategories}
        onCreateChecklist={handleCreateChecklist}
        onCreateDefaultChecklist={handleCreateDefaultChecklist}
        showDefaultChecklist={showDefaultChecklist}
        navigateToCategory={navigateToCategory}
      />
    </div>
  );
};

export default ChecklistList;
