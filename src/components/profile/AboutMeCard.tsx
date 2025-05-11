
import React from "react";
import { Badge } from "@/components/ui/badge";

const AboutMeCard: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border">
      <h3 className="font-semibold text-lg mb-3">About Me</h3>
      <p className="text-gray-600">
        Tech professional exploring Berlin for 6 months. Looking to connect with fellow expats, find great workspaces, and explore the local culture.
      </p>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Goals</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Find apartment</Badge>
          <Badge variant="outline">Make local friends</Badge>
          <Badge variant="outline">Learn German</Badge>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Languages</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">English (Native)</Badge>
          <Badge variant="secondary">German (Basic)</Badge>
          <Badge variant="secondary">Spanish (Intermediate)</Badge>
        </div>
      </div>
    </div>
  );
};

export default AboutMeCard;
