
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Flag, Globe } from "lucide-react";

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
  const [showProfileCard, setShowProfileCard] = useState(false);
  
  const handleAvatarClick = () => {
    if (onImageClick) {
      onImageClick();
    } else {
      setShowProfileCard(true);
    }
  };

  const interests = profile?.university ? [profile.university] : [];
  if (profile?.nationality) {
    interests.push(profile.nationality);
  }
  
  return (
    <div className="flex flex-col items-center mt-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        onClick={handleAvatarClick}
        className={(showUploadButton || !onImageClick) ? "cursor-pointer relative" : ""}
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

      {/* Profile Card Preview Dialog */}
      <Dialog open={showProfileCard} onOpenChange={setShowProfileCard}>
        <DialogContent className="p-0 max-w-md mx-auto w-full rounded-lg overflow-hidden h-[80vh] sm:h-[70vh]">
          <div className="w-full h-full rounded-lg overflow-hidden relative shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: profile?.avatar_url 
                  ? `url(${profile.avatar_url})` 
                  : "url(https://api.dicebear.com/7.x/thumbs/svg?seed=user)" 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{userName || "Anonymous"}</h2>
                <span className="text-xl">{userAge || "?"}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Flag className="h-4 w-4" />
                <p className="text-sm">{profile?.current_city || "Unknown location"}</p>
              </div>
              
              <p className="text-sm mb-4 line-clamp-3">{profile?.about_me || "No bio available"}</p>
              
              <div className="flex flex-wrap gap-2 mb-16">
                {interests.length > 0 ? interests.map(tag => (
                  <Badge 
                    key={tag} 
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    {tag}
                  </Badge>
                )) : (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    No tags
                  </Badge>
                )}
              </div>
            </div>

            <div className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1 text-xs font-semibold shadow">
              <span>Preview mode</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHeader;
