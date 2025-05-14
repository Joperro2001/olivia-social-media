
import React from "react";
import { Loader } from "lucide-react";

const ProfileLoadingState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-gray-400" />
      <p className="mt-4 text-gray-500">Loading profiles...</p>
    </div>
  );
};

export default ProfileLoadingState;
