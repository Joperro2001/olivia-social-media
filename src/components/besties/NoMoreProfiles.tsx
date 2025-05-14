
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NoMoreProfilesProps {
  onRefresh: () => void;
  onStartOver: () => void;
}

const NoMoreProfiles = ({ onRefresh, onStartOver }: NoMoreProfilesProps) => {
  const { toast } = useToast();
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-full bg-gray-100 mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">You've swiped on all profiles</h3>
      <p className="text-gray-500 mb-6 max-w-xs">
        You've viewed all available profiles. Check back later for new connections or refresh to see if any new profiles are available.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity flex items-center gap-2"
          onClick={() => {
            onStartOver();
            toast({
              title: "Starting over",
              description: "Showing profiles from the beginning",
            });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          View Profiles Again
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

export default NoMoreProfiles;
