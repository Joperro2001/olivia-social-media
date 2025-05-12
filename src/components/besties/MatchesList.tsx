import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCheck, UserX, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MatchProfile } from "@/utils/matchHelpers";

interface MatchesListProps {
  profiles: MatchProfile[];
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
  const navigate = useNavigate();

  const handleCardClick = (profileId: string) => {
    if (!showRequests) {
      navigate(`/chat/${profileId}`);
    }
  };

  const handleAcceptMatch = (e: React.MouseEvent, profileId: string, name: string) => {
    e.stopPropagation();
    if (onAcceptMatch) {
      onAcceptMatch(profileId);
    }
  };

  const handleDenyMatch = (e: React.MouseEvent, profileId: string, name: string) => {
    e.stopPropagation();
    if (onDeclineMatch) {
      onDeclineMatch(profileId);
    }
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
      {profiles.map((profile) => {
        const hasMessages = profile.messages && profile.messages.length > 0;
        const lastMessage = hasMessages
          ? profile.messages[profile.messages.length - 1] 
          : profile.hasInitialMessage 
            ? `You and ${profile.name} matched. Let's start messaging!` 
            : "No messages yet. Start chatting!";
            
        return (
          <Card 
            key={profile.id} 
            className={`bg-white/80 backdrop-blur-sm p-4 ${!showRequests ? "cursor-pointer" : ""}`}
            onClick={() => !showRequests && handleCardClick(profile.id)}
          >
            <div className="flex items-start">
              <Avatar className="h-12 w-12">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name} />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}
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
                  {profile.tags && profile.tags.length > 0 ? (
                    profile.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      New User
                    </Badge>
                  )}
                </div>
                
                {/* Show last message if this is in the messages tab */}
                {!showRequests && (
                  <p className="text-sm mt-2 text-gray-600 line-clamp-1">
                    {lastMessage}
                  </p>
                )}
                
                {/* Show bio in requests tab */}
                {showRequests && (
                  <p className="text-sm mt-2 text-gray-600 line-clamp-2">
                    {profile.bio || "This user hasn't added a bio yet."}
                  </p>
                )}
              </div>
            </div>

            {showRequests && (
              <div className="flex justify-end gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => handleDenyMatch(e, profile.id, profile.name)}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button 
                  size="sm"
                  className="bg-primary"
                  onClick={(e) => handleAcceptMatch(e, profile.id, profile.name)}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Accept
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default MatchesList;
