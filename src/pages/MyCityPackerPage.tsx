
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import PackingSection from "@/components/moving/PackingSection";

const MyCityPackerPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // When this page is visited, create an empty checklist if none exists
    // This ensures the "My Checklist" button will navigate here in the future
    if (!localStorage.getItem("cityPackerData")) {
      localStorage.setItem("cityPackerData", JSON.stringify({
        lastVisited: new Date().toISOString()
      }));
    }
  }, []);
  
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
          <h1 className="text-2xl font-bold">My City Packer</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        <PackingSection />
      </div>
    </div>
  );
};

export default MyCityPackerPage;
