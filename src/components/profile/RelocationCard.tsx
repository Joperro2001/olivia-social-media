
import React from "react";
import { Progress } from "@/components/ui/progress";

const RelocationCard: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border">
      <h3 className="font-semibold text-lg mb-4">Relocation Progress</h3>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Preparation</span>
            <span className="text-xs font-medium">80%</span>
          </div>
          <Progress value={80} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Housing</span>
            <span className="text-xs font-medium">30%</span>
          </div>
          <Progress value={30} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Paperwork</span>
            <span className="text-xs font-medium">50%</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default RelocationCard;
