
import React from "react";
import { University, Flag, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface UserInfoCardProps {
  university: string;
  currentCity: string;
  currentCountryFlag: string;
  moveInCity: string;
  moveInCountryFlag: string;
  nationality?: string;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ 
  university, 
  currentCity, 
  currentCountryFlag,
  moveInCity,
  moveInCountryFlag,
  nationality = "British" // Default value
}) => {
  const infoItems = [
    {
      icon: University,
      label: "University",
      value: "LSE"
    },
    {
      icon: Globe,
      label: "Nationality",
      value: nationality
    },
    {
      icon: Flag,
      label: "City",
      value: `${currentCountryFlag} ${currentCity}`
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border"
    >
      <h3 className="font-semibold text-lg mb-3">User Information</h3>
      
      <div className="space-y-4">
        {infoItems.map((item, index) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <item.icon className="h-4 w-4 text-primary" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-medium">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UserInfoCard;
