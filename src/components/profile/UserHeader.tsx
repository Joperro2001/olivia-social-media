
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Flag, Globe, University, CalendarClock, MapPin, Search, X, Maximize, Calendar } from "lucide-react";

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
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  
  const handleAvatarClick = () => {
    if (onImageClick) {
      onImageClick();
    } else {
      setShowProfileCard(true);
    }
  };

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

      {/* Full Screen Image Dialog */}
      <Dialog open={showFullScreenImage} onOpenChange={setShowFullScreenImage}>
        <DialogContent className="p-0 max-w-full w-screen h-screen m-0 rounded-none">
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <img 
              src={profile?.avatar_url || "https://api.dicebear.com/7.x/thumbs/svg?seed=user"} 
              alt={`${userName}'s profile`}
              className="max-h-full max-w-full object-contain"
            />
            <button 
              onClick={() => setShowFullScreenImage(false)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Card Preview Dialog - updated to look like the reference image */}
      <Dialog open={showProfileCard} onOpenChange={setShowProfileCard}>
        <DialogContent className="p-0 max-w-md mx-auto w-full rounded-xl overflow-hidden h-[80vh] sm:h-[70vh]">
          <DialogTitle className="sr-only">Profile Card</DialogTitle>
          <div className="w-full h-full rounded-xl overflow-hidden relative">
            {/* Full screen background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center h-full w-full"
              style={{ 
                backgroundImage: profile?.avatar_url 
                  ? `url(${profile.avatar_url})` 
                  : "url(https://api.dicebear.com/7.x/thumbs/svg?seed=user)" 
              }}
            />
            
            {/* Close button */}
            <button 
              onClick={() => setShowProfileCard(false)}
              className="absolute top-4 right-4 z-30 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Fullscreen button */}
            <button 
              onClick={() => {
                setShowProfileCard(false);
                setShowFullScreenImage(true);
              }}
              className="absolute top-4 left-4 z-30 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Maximize className="h-5 w-5" />
            </button>

            {/* Bottom info card with gradient overlay - improved and enhanced */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              {/* User name and age */}
              <div className="mb-2">
                <h2 className="text-3xl font-bold text-white">{userName} <span className="text-2xl">{userAge}</span></h2>
              </div>
              
              {/* Location */}
              {profile?.current_city && (
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-white" />
                  <p className="text-white/90 text-sm">{profile.current_city}</p>
                </div>
              )}

              {/* Moving to information - ADDED */}
              {profile?.move_in_city && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-white" />
                    <p className="text-white/90 text-sm">
                      Moving to {profile.move_in_city} in {profile.relocation_timeframe || "Next 3 months"}
                    </p>
                  </div>
                  
                  {/* Looking for information - ADDED */}
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-white" />
                    <p className="text-white/90 text-sm">Looking for</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-1 mb-4 pl-6">
                    {profile?.relocation_interests && profile.relocation_interests.map((interest: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-white/20 text-white border-none">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Badges/Tags/Interests */}
              <div className="flex flex-wrap gap-2 mb-4">
                {profile?.nationality && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">
                    {profile.nationality}
                  </Badge>
                )}
                {profile?.university && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">
                    {profile.university}
                  </Badge>
                )}
                {profile?.interests && profile.interests.map((interest, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-white/20 text-white border-none">
                    {interest}
                  </Badge>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <X className="h-6 w-6 text-red-500" />
                </button>
                <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#FF5757" stroke="#FF5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Improved gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHeader;
