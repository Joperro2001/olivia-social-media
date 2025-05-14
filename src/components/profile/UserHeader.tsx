
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Flag, Globe, University, CalendarClock, MapPin, Search, X, Maximize } from "lucide-react";

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

      {/* Full Screen Image Dialog - Removed all overlays */}
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

      {/* Profile Card Preview Dialog */}
      <Dialog open={showProfileCard} onOpenChange={setShowProfileCard}>
        <DialogContent className="p-0 max-w-md mx-auto w-full rounded-lg overflow-hidden h-[80vh] sm:h-[70vh]">
          <div className="w-full h-full rounded-lg overflow-hidden relative shadow-xl flex flex-col">
            <div className="h-1/3 relative">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ 
                  backgroundImage: profile?.avatar_url 
                    ? `url(${profile.avatar_url})` 
                    : "url(https://api.dicebear.com/7.x/thumbs/svg?seed=user)" 
                }}
              >
                {/* Removed gradient overlay here - this allows the image to be fully visible */}
                
                {/* Add fullscreen button */}
                <button 
                  onClick={() => {
                    setShowProfileCard(false);
                    setShowFullScreenImage(true);
                  }}
                  className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition-colors"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{userName || "Anonymous"}</h2>
                  <span className="text-xl">{userAge || "?"}</span>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-5 bg-white">
              {/* Bio section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                <p className="text-gray-700">{profile?.about_me || "No bio available"}</p>
              </div>
              
              {/* Location & University */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current city</p>
                    <p className="font-medium">{profile?.current_city || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className="font-medium">{profile?.nationality || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <University className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">University</p>
                    <p className="font-medium">{profile?.university || "Not specified"}</p>
                  </div>
                </div>
              </div>
              
              {/* Relocation info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Relocation</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Flag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Moving to</p>
                      <p className="font-medium">{profile?.move_in_city || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarClock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">When</p>
                      <p className="font-medium">{profile?.relocation_timeframe || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Looking for</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {profile?.relocation_interests && profile.relocation_interests.length > 0 ? (
                          profile.relocation_interests.map((interest, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="bg-lavender-light text-primary-dark"
                            >
                              {interest}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Interests */}
              {profile?.interests ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((tag, index) => (
                      <Badge 
                        key={index} 
                        className="bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
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
