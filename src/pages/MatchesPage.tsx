
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import MatchesTabContent from "@/components/besties/MatchesTabContent";
import RequestsTabContent from "@/components/besties/RequestsTabContent";
import { useMatches } from "@/hooks/useMatches";

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    isLoading, 
    acceptedProfiles, 
    pendingProfiles,
    handleAcceptMatch,
    handleDeclineMatch
  } = useMatches({ userId: user?.id || '' });

  if (isLoading) {
    return (
      <div className="flex flex-col h-[100vh] bg-[#FDF5EF]">
        <LoadingSpinner message="Loading matches..." />
      </div>
    );
  }

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
            <MatchesTabContent profiles={acceptedProfiles} />
          </TabsContent>
          
          <TabsContent value="requests" className="mt-0">
            <RequestsTabContent 
              profiles={pendingProfiles}
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
