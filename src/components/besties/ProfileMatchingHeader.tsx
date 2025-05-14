
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAIRankProfiles } from "@/hooks/useAIRankProfiles";
import { Brain, Loader, RefreshCw } from "lucide-react";
import CreateDemoUsersButton from './CreateDemoUsersButton';

interface ProfileMatchingHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProfileMatchingHeader: React.FC<ProfileMatchingHeaderProps> = ({ 
  onRefresh,
  isRefreshing
}) => {
  const { isRanking, rankProfiles, isAIRankingActive, toggleAIRanking } = useAIRankProfiles();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-2">
        <Button
          variant={isAIRankingActive ? "default" : "outline"}
          size="sm"
          onClick={() => {
            toggleAIRanking(!isAIRankingActive);
            if (!isAIRankingActive) {
              rankProfiles();
            }
          }}
          className={`flex items-center gap-1 ${isAIRankingActive ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white' : ''}`}
          disabled={isRanking}
        >
          {isRanking ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {isRanking ? "Ranking..." : "AI Match"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          {isRefreshing ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      <CreateDemoUsersButton />
    </div>
  );
};

export default ProfileMatchingHeader;
