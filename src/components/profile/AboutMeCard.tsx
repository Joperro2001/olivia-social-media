
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const AboutMeCard: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border"
    >
      <h3 className="font-semibold text-lg mb-3">About Me</h3>
      <p className="text-gray-600">
        Tech professional exploring Berlin for 6 months. Looking to connect with fellow expats, find great workspaces, and explore the local culture.
      </p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-4 space-y-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Goals</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Find apartment", "Make local friends", "Learn German"].map((goal, index) => (
            <motion.div
              key={goal}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
            >
              <Badge variant="outline">{goal}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="mt-4 space-y-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Languages</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { lang: "English", level: "Native" },
            { lang: "German", level: "Basic" },
            { lang: "Spanish", level: "Intermediate" }
          ].map((item, index) => (
            <motion.div
              key={item.lang}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
            >
              <Badge variant="secondary">{`${item.lang} (${item.level})`}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutMeCard;
