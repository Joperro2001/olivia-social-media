
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ProfileMatchingHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProfileMatchingHeader: React.FC<ProfileMatchingHeaderProps> = ({
  onRefresh,
  isRefreshing
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Profile Matching</h2>
      </div>
      <div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Profiles
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileMatchingHeader;
