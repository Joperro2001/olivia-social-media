
import React, { useState } from "react";
import GroupMatchCard from "./GroupMatchCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  memberCount: number;
  location: string;
  description: string;
  image: string;
  tags: string[];
  matchPercentage: number;
}

interface GroupMatchingProps {
  groups: Group[];
  onJoinRequest: (groupId: string) => void;
}

const GroupMatching: React.FC<GroupMatchingProps> = ({ groups, onJoinRequest }) => {
  const { toast } = useToast();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  const handleGroupSwipeLeft = (id: string) => {
    console.log(`Swiped left on group ${id}`);
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    }
  };

  const handleGroupSwipeRight = (id: string) => {
    console.log(`Swiped right on group ${id}`);
    toast({
      title: "Group Match Request Sent! 🎉",
      description: `You've requested to join ${groups[currentGroupIndex].name}. We'll notify you when the group approves.`,
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none",
    });
    
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {groups.length > 0 && currentGroupIndex < groups.length ? (
        <GroupMatchCard
          group={groups[currentGroupIndex]}
          onSwipeLeft={handleGroupSwipeLeft}
          onSwipeRight={handleGroupSwipeRight}
        />
      ) : (
        <div className="text-center px-4 py-10">
          <h3 className="text-xl font-semibold mb-2">No more groups</h3>
          <p className="text-gray-500 mb-6">Check back later for new group matches</p>
          <Button 
            onClick={() => setCurrentGroupIndex(0)}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
          >
            Reset Groups (Demo)
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupMatching;
