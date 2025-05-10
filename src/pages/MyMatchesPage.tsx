
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus, Calendar, Users } from "lucide-react";
import { matchedProfiles, matchedGroups, rsvpEvents } from "@/data/matchesMockData";
import type { MatchedProfile, MatchedGroup, Event } from "@/data/matchesMockData";

const MyMatchesPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("people");

  const handleMessage = (name: string) => {
    toast({
      title: "Message sent!",
      description: `You opened a chat with ${name}`,
    });
  };

  const handleLeaveGroup = (groupId: string) => {
    const group = matchedGroups.find(g => g.id === groupId);
    if (group) {
      toast({
        title: "Group left",
        description: `You have left the ${group.name} group`,
        variant: "destructive",
      });
    }
  };

  const handleViewEventDetails = (eventId: string) => {
    const event = rsvpEvents.find(e => e.id === eventId);
    if (event) {
      toast({
        title: "Event details",
        description: `Viewing details for ${event.title}`,
      });
    }
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#D3E4FD] pb-16">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">My Matches</h1>
      </div>
      
      <div className="px-4 flex-1 overflow-hidden">
        <Tabs defaultValue="people" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="people" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span>People</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Groups</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="mt-2 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="grid grid-cols-1 gap-4">
              {matchedProfiles.length > 0 ? (
                matchedProfiles.map((profile) => (
                  <ProfileMatchCard 
                    key={profile.id}
                    profile={profile}
                    onMessage={handleMessage}
                  />
                ))
              ) : (
                <EmptyState message="No matches found" description="Start swiping to find your besties!" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-2 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="grid grid-cols-1 gap-4">
              {matchedGroups.length > 0 ? (
                matchedGroups.map((group) => (
                  <GroupMatchCard 
                    key={group.id}
                    group={group}
                    onLeaveGroup={handleLeaveGroup}
                  />
                ))
              ) : (
                <EmptyState message="No groups joined" description="Join groups to see them here!" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-2 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="grid grid-cols-1 gap-4">
              {rsvpEvents.length > 0 ? (
                rsvpEvents.map((event) => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewEventDetails}
                  />
                ))
              ) : (
                <EmptyState message="No events" description="RSVP to events to see them here!" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface ProfileMatchCardProps {
  profile: MatchedProfile;
  onMessage: (name: string) => void;
}

const ProfileMatchCard: React.FC<ProfileMatchCardProps> = ({ profile, onMessage }) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex h-24 md:h-32 bg-white">
        <div className="w-24 md:w-32 h-full">
          <div 
            className="h-full w-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${profile.image})` }}
          />
        </div>
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {profile.name} <span className="text-sm font-normal">{profile.age}</span>
              </h3>
              <p className="text-xs text-gray-500">{profile.location}</p>
            </div>
            <span className="text-xs text-gray-400">Matched {profile.matchDate}</span>
          </div>
          
          <p className="text-sm mt-1 line-clamp-1">{profile.bio}</p>
          
          <div className="flex mt-2 justify-between items-center">
            <div className="flex flex-wrap gap-1">
              {profile.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {profile.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{profile.tags.length - 2}</span>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="default"
              className="h-8"
              onClick={(e) => {
                e.preventDefault();
                onMessage(profile.name);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> Message
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

interface GroupMatchCardProps {
  group: MatchedGroup;
  onLeaveGroup: (id: string) => void;
}

const GroupMatchCard: React.FC<GroupMatchCardProps> = ({ group, onLeaveGroup }) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex h-24 md:h-32 bg-white">
        <div className="w-24 md:w-32 h-full">
          <div 
            className="h-full w-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${group.image})` }}
          />
        </div>
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>{group.memberCount} members</span>
              </div>
            </div>
            <span className="text-xs text-gray-400">Joined {group.joinDate}</span>
          </div>
          
          <p className="text-sm mt-1 line-clamp-1">{group.description}</p>
          
          <div className="flex mt-2 justify-between items-center">
            <div className="flex flex-wrap gap-1">
              {group.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {group.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{group.tags.length - 2}</span>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-200 hover:bg-red-50"
              onClick={() => onLeaveGroup(group.id)}
            >
              Leave
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

interface EventCardProps {
  event: Event;
  onViewDetails: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  return (
    <Card className="overflow-hidden cursor-pointer" onClick={() => onViewDetails(event.id)}>
      <div className="flex h-24 md:h-32 bg-white">
        <div className="w-24 md:w-32 h-full">
          <div 
            className="h-full w-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${event.image})` }}
          />
        </div>
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
            <Badge 
              variant={event.status === "Attended" ? "secondary" : "default"}
              className="text-xs"
            >
              {event.status}
            </Badge>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{event.date}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{event.location}</p>
          
          <div className="flex mt-2 justify-between items-center">
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              {event.attendees} attendees
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

interface EmptyStateProps {
  message: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default MyMatchesPage;
