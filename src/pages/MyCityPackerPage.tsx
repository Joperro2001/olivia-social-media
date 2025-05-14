
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChecklistList from "@/components/moving/ChecklistList";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

const MyCityPackerPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/city")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Relocation Documents</h1>
            <p className="text-sm text-muted-foreground">Track your essential documents and requirements</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        <Suspense fallback={
          <div className="flex flex-col h-64 items-center justify-center">
            <Spinner size="lg" className="text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your documents...</p>
          </div>
        }>
          <ChecklistList />
        </Suspense>
      </div>
    </div>
  );
};

export default MyCityPackerPage;
