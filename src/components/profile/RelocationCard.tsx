
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";

interface RelocationCardProps {
  moveInCity: string;
}

const RelocationCard: React.FC<RelocationCardProps> = ({ moveInCity }) => {
  const city = moveInCity || "Your city";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">Relocation Status</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Active</Badge>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Moving to</p>
            <p className="font-medium">{city}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Timeframe</p>
            <p className="font-medium">Next 3 months</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Looking for</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="bg-lavender-light text-primary-dark">Accommodation tips</Badge>
              <Badge variant="secondary" className="bg-lavender-light text-primary-dark">Local guides</Badge>
              <Badge variant="secondary" className="bg-lavender-light text-primary-dark">Social events</Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-5">
        <Button className="w-full">Update Relocation Status</Button>
      </div>
    </motion.div>
  );
};

export default RelocationCard;
