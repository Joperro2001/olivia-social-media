
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChecklistDetail from "@/components/moving/ChecklistDetail";
import { fetchChecklistWithItems } from "@/utils/checklistUtils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const ChecklistDetailPage: React.FC = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadChecklist = async () => {
      if (!checklistId) {
        navigate("/my-city-packer");
        return;
      }
      
      try {
        setLoading(true);
        const data = await fetchChecklistWithItems(checklistId);
        
        if (!data) {
          toast({
            title: "Error",
            description: "Checklist not found",
            variant: "destructive"
          });
          navigate("/my-city-packer");
          return;
        }
        
        setChecklist(data);
      } catch (error) {
        console.error("Error loading checklist:", error);
        toast({
          title: "Error",
          description: "Failed to load checklist",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadChecklist();
  }, [checklistId, navigate, toast]);
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#FDF5EF]">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/my-city-packer")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Checklist</h1>
          </div>
        </div>
        <div className="px-4 flex-1 overflow-auto">
          <LoadingSpinner message="Loading checklist..." />
        </div>
      </div>
    );
  }
  
  if (!checklist) {
    return null;
  }
  
  return (
    <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/my-city-packer")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Checklist</h1>
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        <ChecklistDetail 
          checklist={checklist} 
          onDeleted={() => navigate("/my-city-packer")}
          onUpdated={() => {}}
        />
      </div>
    </div>
  );
};

export default ChecklistDetailPage;
