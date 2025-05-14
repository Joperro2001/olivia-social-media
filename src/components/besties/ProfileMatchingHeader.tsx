
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users } from 'lucide-react';

interface ProfileMatchingHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProfileMatchingHeader: React.FC<ProfileMatchingHeaderProps> = ({
  onRefresh,
  isRefreshing
}) => {
  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-500" />
        <span className="font-medium">Berlin Matchmaking</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={onRefresh} 
          disabled={isRefreshing}
          size="sm" 
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileMatchingHeader;
