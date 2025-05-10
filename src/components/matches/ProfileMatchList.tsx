
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  tags: string[];
  matchDate: string;
}

interface ProfileMatchListProps {
  profiles: Profile[];
}

const ProfileMatchList: React.FC<ProfileMatchListProps> = ({ profiles }) => {
  const { toast } = useToast();
  
  const handleMessage = (name: string) => {
    toast({
      title: `Message sent to ${name}!`,
      description: "You'll be able to chat in the full version.",
      className: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-none",
    });
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No matches yet</h3>
        <p className="text-gray-500">
          Start swiping to find your matches
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile.id} className="overflow-hidden">
          <div className="flex">
            <div className="w-1/3">
              <img 
                src={profile.image} 
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="w-2/3 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{profile.name}, {profile.age}</h3>
                  <p className="text-xs text-gray-500 mb-1">{profile.location}</p>
                </div>
                <span className="text-xs text-gray-400">
                  Matched {new Date(profile.matchDate).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm mb-3 line-clamp-2">{profile.bio}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {profile.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => handleMessage(profile.name)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProfileMatchList;
