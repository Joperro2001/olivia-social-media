
import React, { useState } from "react";
import ProfileCard from "@/components/besties/ProfileCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  tags: string[];
}

interface ProfileMatchingProps {
  profiles: Profile[];
  onMatchFound?: () => void;
}

const ProfileMatching: React.FC<ProfileMatchingProps> = ({ profiles, onMatchFound }) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = (id: string) => {
    console.log(`Swiped left on ${id}`);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = (id: string) => {
    console.log(`Swiped right on ${id}`);
    toast({
      title: "It's a match! 🎉",
      description: `You and ${profiles[currentIndex].name} might be a good fit! We'll notify them.`,
      className: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-none",
    });
    
    // Simply move to the next profile instead of redirecting
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {profiles.length > 0 && currentIndex < profiles.length ? (
        <ProfileCard
          key={profiles[currentIndex].id}
          {...profiles[currentIndex]}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      ) : (
        <div className="text-center px-4 py-10">
          <h3 className="text-xl font-semibold mb-2">There are no more matches</h3>
          <p className="text-gray-500 mb-6">Try again in a while to find new connections</p>
          <Button 
            onClick={() => setCurrentIndex(0)}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity"
          >
            Reset Profiles (Demo)
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileMatching;
