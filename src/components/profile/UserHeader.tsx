
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface UserHeaderProps {
  userName: string;
  userAge: number;
}

const UserHeader: React.FC<UserHeaderProps> = ({ userName, userAge }) => {
  return (
    <div className="flex flex-col items-center mt-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Avatar className="w-28 h-28 border-4 border-white shadow-md">
          <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=user" alt="User profile" className="w-full h-full object-cover" />
        </Avatar>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-4 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl font-bold">{userName}</h2>
          <span className="text-gray-500">• {userAge}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UserHeader;
