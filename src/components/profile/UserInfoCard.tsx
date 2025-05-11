
import React from "react";
import { University, Flag, MapPin } from "lucide-react";

interface UserInfoCardProps {
  university: string;
  currentCity: string;
  currentCountryFlag: string;
  moveInCity: string;
  moveInCountryFlag: string;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ 
  university, 
  currentCity, 
  currentCountryFlag,
  moveInCity,
  moveInCountryFlag 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border">
      <h3 className="font-semibold text-lg mb-3">User Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <University className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">University</p>
            <p className="font-medium">{university}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Flag className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Current City</p>
            <p className="font-medium">{currentCountryFlag} {currentCity}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">City for Move-in</p>
            <p className="font-medium">{moveInCountryFlag} {moveInCity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
