
import React, { useState } from "react";
import MatchesList from "@/components/besties/MatchesList";
import { matchedProfiles } from "@/data/matchesMockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(matchedProfiles);
  
  // Separate profiles into accepted and pending
  const acceptedProfiles = profiles.filter(profile => !profile.isPending);
  const pendingProfiles = profiles.filter(profile => profile.isPending);

  // Handler for accepting a match request
  const handleAcceptMatch = (profileId: string) => {
    setProfiles(prevProfiles => 
      prevProfiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, isPending: false, hasInitialMessage: true } 
          : profile
      )
    );
  };

  // Handler for declining a match request
  const handleDeclineMatch = (profileId: string) => {
    setProfiles(prevProfiles => 
      prevProfiles.filter(profile => profile.id !== profileId)
    );
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center px-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/besties")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-left">My Matches</h1>
      </div>

      <div className="px-4 pb-4 flex-1 overflow-y-auto">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {pendingProfiles.length > 0 && (
                <span className="ml-1 bg-primary rounded-full w-5 h-5 text-xs flex items-center justify-center text-white">
                  {pendingProfiles.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="mt-0">
            <MatchesList 
              profiles={acceptedProfiles} 
              showRequests={false}
            />
          </TabsContent>
          
          <TabsContent value="requests" className="mt-0">
            <MatchesList 
              profiles={pendingProfiles}
              showRequests={true}
              onAcceptMatch={handleAcceptMatch}
              onDeclineMatch={handleDeclineMatch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MatchesPage;
