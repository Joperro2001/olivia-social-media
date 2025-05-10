
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { MatchedProfile } from "@/data/matchesMockData";
import { useToast } from "@/hooks/use-toast";

interface MatchesListProps {
  profiles: MatchedProfile[];
}

const MatchesList: React.FC<MatchesListProps> = ({ profiles }) => {
  const { toast } = useToast();

  const handleMessageClick = (name: string) => {
    toast({
      title: "Message Started",
      description: `Starting conversation with ${name}`,
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none",
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="space-y-4">
        {profiles.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
            <p className="text-gray-500">Try the Suggested tab to find new connections</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <Card key={profile.id} className="bg-white/80 backdrop-blur-sm p-4">
              <div className="flex items-start">
                <Avatar className="h-12 w-12">
                  <img src={profile.image} alt={profile.name} />
                </Avatar>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{profile.name}</h3>
                      <p className="text-xs text-gray-500">{profile.location}</p>
                    </div>
                    <span className="text-xs text-gray-400">Matched {profile.matchDate}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {profile.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm mt-2 text-gray-600 line-clamp-2">
                    {profile.bio}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button 
                  size="sm" 
                  className="bg-primary"
                  onClick={() => handleMessageClick(profile.name)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default MatchesList;
