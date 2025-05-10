
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EventHeaderProps {
  title: string;
}

const EventHeader: React.FC<EventHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#FDF5EF] z-10">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/social")}
        className="text-black hover:bg-black/10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="w-9"></div> {/* Spacer for layout balance */}
    </div>
  );
};

export default EventHeader;
