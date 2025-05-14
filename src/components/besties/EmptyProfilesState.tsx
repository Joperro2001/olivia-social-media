
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmptyProfilesStateProps {
  onRefresh: () => void;
}

const EmptyProfilesState = ({ onRefresh }: EmptyProfilesStateProps) => {
  const { toast } = useToast();
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-full bg-gray-100 mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Berlin matches available</h3>
      <p className="text-gray-500 mb-6 max-w-xs">
        There are no other users moving to Berlin on the platform yet. Make sure your profile is set up with Berlin as your destination and try refreshing.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity flex items-center gap-2"
          onClick={() => {
            toast({
              title: "Invite link copied!",
              description: "Share this link with friends moving to Berlin to join the platform.",
            });
          }}
        >
          <UserPlus className="h-4 w-4" />
          Invite Berlin Friends
        </Button>
        <Button 
          variant="outline"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default EmptyProfilesState;
