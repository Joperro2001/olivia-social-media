
import React from "react";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileEditHeaderProps {
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
}

const ProfileEditHeader: React.FC<ProfileEditHeaderProps> = ({ onSave, onBack, isSaving }) => {
  return (
    <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-10 bg-[#FDF5EF]">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-2"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>
      <Button 
        onClick={onSave}
        className="flex items-center gap-1"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
            Saving...
          </>
        ) : (
          <>
            <Save size={16} />
            Save
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfileEditHeader;
