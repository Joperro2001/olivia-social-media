import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, UserPlus, X, Check } from "lucide-react";

const MyMatchesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pending");
  
  const pendingMatches = [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=sarah",
      location: "Berlin",
      interests: ["Tech", "Hiking", "Photography"],
      matchReason: "Both looking for housing in Kreuzberg",
    },
    {
      id: "2",
      name: "Miguel Rodriguez",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=miguel",
      location: "Berlin",
      interests: ["Music", "Startups", "Coffee"],
      matchReason: "Both interested in tech networking events",
    },
    {
      id: "3",
      name: "Expats in Berlin",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=group1",
      memberCount: 8,
      isGroup: true,
      interests: ["Networking", "Social", "Culture"],
      matchReason: "Group for English-speaking professionals",
    },
  ];
  
  const acceptedMatches = [
    {
      id: "4",
      name: "David Kim",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=david",
      location: "Berlin",
      interests: ["Fitness", "Cooking", "Languages"],
      lastMessage: "Let's meet at that café on Sunday!",
      lastMessageTime: "2h ago",
    },
    {
      id: "5",
      name: "Berlin Tech Hub",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=group2",
      memberCount: 12,
      isGroup: true,
      interests: ["Technology", "Startups", "Networking"],
      lastMessage: "Anyone going to the meetup tomorrow?",
      lastMessageTime: "5h ago",
    },
  ];
  
  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">My Matches</h1>
      </div>
      
      <div className="px-4">
        <Tabs defaultValue="pending" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span>Pending</span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>Connected</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-2">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-4">
                {pendingMatches.map((match) => (
                  <div key={match.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 border">
                    <div className="flex items-start">
                      <Avatar className="h-12 w-12">
                        <img src={match.avatar} alt={match.name} />
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{match.name}</h3>
                            {match.isGroup ? (
                              <p className="text-xs text-gray-500">{match.memberCount} members</p>
                            ) : (
                              <p className="text-xs text-gray-500">{match.location}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {match.interests.slice(0, 3).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm mt-2 text-gray-600">
                          <span className="font-medium">Match reason:</span> {match.matchReason}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-primary">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="accepted" className="mt-2">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-4">
                {acceptedMatches.map((match) => (
                  <div key={match.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 border">
                    <div className="flex items-start">
                      <Avatar className="h-12 w-12">
                        <img src={match.avatar} alt={match.name} />
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{match.name}</h3>
                            {match.isGroup ? (
                              <p className="text-xs text-gray-500">{match.memberCount} members</p>
                            ) : (
                              <p className="text-xs text-gray-500">{match.location}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{match.lastMessageTime}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {match.interests.slice(0, 3).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm mt-2 text-gray-600 truncate">
                          {match.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button size="sm" className="bg-primary">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyMatchesPage;
