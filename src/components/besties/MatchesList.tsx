
import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Check, UserCheck, UserX } from "lucide-react";
import { MatchedProfile } from "@/data/matchesMockData";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface MatchesListProps {
  profiles: MatchedProfile[];
  showRequests?: boolean;
  onAcceptMatch?: (profileId: string) => void;
  onDeclineMatch?: (profileId: string) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ 
  profiles, 
  showRequests = false,
  onAcceptMatch,
  onDeclineMatch
}) => {
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string[]>>({});
  const [currentMessage, setCurrentMessage] = useState("");

  const handleMessageClick = (id: string) => {
    setActiveChat(id);
    
    // Check if this is the first time opening the chat and it has an initial message
    const profile = profiles.find(p => p.id === id);
    if (profile?.hasInitialMessage && !messages[id]) {
      setMessages(prev => ({
        ...prev,
        [id]: [`You and ${profile.name} matched. Let's start messaging!`]
      }));
    }
  };

  const handleSendMessage = (profileId: string, name: string) => {
    if (!currentMessage.trim()) return;

    // Add message to chat history
    setMessages(prev => ({
      ...prev,
      [profileId]: [...(prev[profileId] || []), currentMessage]
    }));

    toast({
      title: "Message Sent",
      description: `Your message was sent to ${name}`,
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none",
    });
    
    setCurrentMessage("");
  };

  const handleAcceptMatch = (profileId: string, name: string) => {
    onAcceptMatch?.(profileId);
    toast({
      title: "Match Accepted",
      description: `You've connected with ${name}!`,
      className: "bg-gradient-to-r from-green-500 to-teal-500 text-white border-none",
    });
  };

  const handleDenyMatch = (profileId: string, name: string) => {
    onDeclineMatch?.(profileId);
    toast({
      title: "Match Declined",
      description: `You declined the match request from ${name}.`,
    });
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">
          {showRequests ? "No pending requests" : "No matches yet"}
        </h3>
        <p className="text-gray-500">
          {showRequests 
            ? "When someone likes your profile, they'll appear here"
            : "Like profiles to find new connections"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
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
                {showRequests ? (
                  <span className="text-xs font-medium text-amber-500">Match Request</span>
                ) : (
                  <span className="text-xs text-gray-400">Matched {profile.matchDate}</span>
                )}
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

          {showRequests ? (
            <div className="flex justify-end gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDenyMatch(profile.id, profile.name)}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <UserX className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button 
                size="sm"
                className="bg-primary"
                onClick={() => handleAcceptMatch(profile.id, profile.name)}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          ) : activeChat === profile.id ? (
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
              
              {/* Chat messages */}
              {messages[profile.id] && messages[profile.id].length > 0 && (
                <div className="bg-gray-50 p-3 rounded-md mb-2 max-h-[120px] overflow-y-auto">
                  {messages[profile.id].map((msg, idx) => (
                    <div key={idx} className="text-sm mb-1">
                      {msg}
                    </div>
                  ))}
                </div>
              )}
              
              <Textarea
                placeholder={`Send a message to ${profile.name}...`}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                className="min-h-[80px] mb-2"
              />
              <div className="flex justify-end">
                <Button 
                  className="bg-primary"
                  onClick={() => handleSendMessage(profile.id, profile.name)}
                  disabled={!currentMessage.trim()}
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
      ))}
    </div>
  );
};

export default MatchesList;
