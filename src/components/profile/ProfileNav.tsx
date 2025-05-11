
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          aria-label="Settings"
          className="rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10"
        >
          <Settings size={18} className="text-gray-600" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          aria-label="Edit Profile"
          className="rounded-full border border-gray-200 bg-white shadow-sm w-10 h-10"
        >
          <Edit size={18} className="text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileNav;
