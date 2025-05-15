
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserHeader from "@/components/profile/UserHeader";
import { Profile } from "@/types/Profile";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageSectionProps {
  profile: Profile | null;
  uploadAvatar: (file: File) => Promise<string | null>;
}

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({ profile, uploadAvatar }) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageClick = () => {
    setIsImageDialogOpen(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      await uploadAvatar(file);
      setIsImageDialogOpen(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mb-6">
      <UserHeader 
        userAge={profile?.age || 25} 
        showUploadButton={true}
        onImageClick={handleImageClick}
      />

      {/* Hidden file input for image upload */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-5 gap-4">
            <div className="relative rounded-full overflow-hidden w-32 h-32">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Current profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src="https://api.dicebear.com/7.x/thumbs/svg?seed=user" 
                  alt="Default profile" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <Button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Uploading...
                </>
              ) : (
                "Upload new picture"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileImageSection;
