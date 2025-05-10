
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Users, Calendar } from "lucide-react";
import ProfileMatchList from "@/components/matches/ProfileMatchList";
import GroupMatchList from "@/components/matches/GroupMatchList";
import EventList from "@/components/matches/EventList";
import { matchedProfiles, matchedGroups, attendedEvents } from "@/data/matchesMockData";

const MyMatchesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("people");
  
  return (
    <div className="flex flex-col h-[100vh] bg-[#D3E4FD] pb-16">
      <div className="flex items-center justify-center px-4 py-4">
        <h1 className="text-2xl font-bold text-black">My Connections</h1>
      </div>
      
      <div className="px-4 mb-4 flex-1 overflow-auto">
        <Tabs 
          defaultValue="people" 
          className="w-full" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full grid grid-cols-3 mb-2">
            <TabsTrigger value="people" className="flex items-center gap-1">
              <User className="h-4 w-4" />
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

          <TabsContent value="people" className="mt-2">
            <ProfileMatchList profiles={matchedProfiles} />
          </TabsContent>

          <TabsContent value="groups" className="mt-2">
            <GroupMatchList groups={matchedGroups} />
          </TabsContent>

          <TabsContent value="events" className="mt-2">
            <EventList events={attendedEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyMatchesPage;
