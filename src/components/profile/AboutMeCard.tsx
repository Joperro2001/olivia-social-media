
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

interface AboutMeCardProps {
  aboutMe: string;
  interests: string[];
}

const AboutMeCard: React.FC<AboutMeCardProps> = ({ aboutMe, interests }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border"
    >
      <h3 className="font-semibold text-lg mb-3">About Me</h3>
      <p className="text-gray-600">
        {aboutMe || "No bio provided yet."}
      </p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="mt-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-primary" />
          <span className="text-sm font-medium">Interests</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.length > 0 ? (
            interests.map((interest, index) => (
              <motion.div
                key={interest}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
              >
                <Badge variant="secondary" className="bg-lavender-light text-primary-dark hover:bg-lavender">{interest}</Badge>
              </motion.div>
            ))
          ) : (
            <span className="text-sm text-gray-500">No interests added yet.</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutMeCard;
