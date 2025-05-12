
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

interface UserHeaderProps {
  userAge: number;
  showUploadButton?: boolean;
  onImageClick?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ 
  userAge, 
  showUploadButton = false, 
  onImageClick 
}) => {
  const { profile } = useProfile();
  const userName = profile?.full_name || "User";
  
  return (
    <div className="flex flex-col items-center mt-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        onClick={onImageClick}
        className={showUploadButton ? "cursor-pointer relative" : ""}
      >
        <Avatar className="w-28 h-28 border-4 border-white shadow-md">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={`${userName}'s profile`} />
          ) : (
            <AvatarImage 
              src="https://api.dicebear.com/7.x/thumbs/svg?seed=user" 
              alt="User profile"
            />
          )}
          <AvatarFallback>
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {showUploadButton && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">Change photo</span>
          </div>
        )}
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
