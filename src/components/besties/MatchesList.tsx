
import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";
import { MatchedProfile } from "@/data/matchesMockData";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface MatchesListProps {
  profiles: MatchedProfile[];
}

const MatchesList: React.FC<MatchesListProps> = ({ profiles }) => {
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleMessageClick = (id: string) => {
    setActiveChat(id);
  };

  const handleSendMessage = (name: string) => {
    if (!message.trim()) return;

    toast({
      title: "Message Sent",
      description: `Your message was sent to ${name}`,
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none",
    });
    setMessage("");
    // In a real app, this would send the message to the backend
  };

  return (
    <div className="space-y-4">
      {profiles.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
          <p className="text-gray-500">Like profiles to find new connections</p>
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

            {activeChat === profile.id ? (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Chat with {profile.name}</h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setActiveChat(null)} 
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder={`Send a message to ${profile.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px] mb-2"
                />
                <div className="flex justify-end">
                  <Button 
                    className="bg-primary"
                    onClick={() => handleSendMessage(profile.name)}
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end mt-3">
                <Button 
                  size="sm" 
                  className="bg-primary"
                  onClick={() => handleMessageClick(profile.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default MatchesList;
