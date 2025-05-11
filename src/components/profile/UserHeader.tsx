
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserHeaderProps {
  userName: string;
  userAge: number;
  userCity: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ userName, userAge, userCity }) => {
  return (
    <div className="flex flex-col items-center mt-2">
      <Avatar className="w-28 h-28 border-4 border-white shadow-md">
        <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=user" alt="User profile" className="w-full h-full object-cover" />
      </Avatar>
      
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl font-bold">{userName}</h2>
          <span className="text-gray-500">• {userAge}</span>
        </div>
        <div className="flex items-center justify-center mt-1">
          <Badge className="bg-lavender-dark text-primary">🗺️ Moving to {userCity}</Badge>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
