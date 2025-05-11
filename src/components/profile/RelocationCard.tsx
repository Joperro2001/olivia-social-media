
import React from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const RelocationCard: React.FC = () => {
  const progressItems = [
    { name: "Preparation", value: 80 },
    { name: "Housing", value: 30 },
    { name: "Paperwork", value: 50 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border"
    >
      <h3 className="font-semibold text-lg mb-4">Relocation Progress</h3>
      
      <div className="space-y-4">
        {progressItems.map((item, index) => (
          <motion.div 
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.2, duration: 0.4 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{item.name}</span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.2, duration: 0.3 }}
                className="text-xs font-medium"
              >
                {item.value}%
              </motion.span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.7 + index * 0.2, duration: 0.5 }}
            >
              <Progress value={item.value} className="h-2" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RelocationCard;
