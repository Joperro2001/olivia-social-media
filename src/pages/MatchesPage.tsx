
import React, { useState, useEffect } from "react";
import MatchesList from "@/components/besties/MatchesList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Define profile type
interface MatchProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  bio: string;
  matchDate: string;
  tags: string[];
  isPending?: boolean;
  hasInitialMessage?: boolean;
  messages?: string[];
}

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (user) {
      fetchMatchedProfiles();
    }
  }, [user]);

  const fetchMatchedProfiles = async () => {
    setIsLoading(true);
    try {
      // Fetch matches where current user is user_id_1
      const { data: matches1, error: error1 } = await supabase
        .from('profile_matches')
        .select(`
          id, 
          status,
          matched_at,
          user_id_2,
          profiles!profile_matches_user_id_2_fkey(
            id, 
            full_name, 
            avatar_url, 
            age, 
            current_city, 
            about_me
          )
        `)
        .eq('user_id_1', user.id);

      // Fetch matches where current user is user_id_2
      const { data: matches2, error: error2 } = await supabase
        .from('profile_matches')
        .select(`
          id, 
          status,
          matched_at,
          user_id_1,
          profiles!profile_matches_user_id_1_fkey(
            id, 
            full_name, 
            avatar_url, 
            age, 
            current_city, 
            about_me
          )
        `)
        .eq('user_id_2', user.id);

      if (error1 || error2) {
        console.error('Error fetching matches:', error1 || error2);
        throw new Error(error1?.message || error2?.message);
      }

      // Transform matches data to the required format
      const formattedProfiles: MatchProfile[] = [];
      
      // Process matches where user is user_id_1
      if (matches1?.length) {
        matches1.forEach(match => {
          if (match.profiles) {
            const profile = match.profiles;
            formattedProfiles.push({
              id: profile.id,
              name: profile.full_name || 'Anonymous',
              age: profile.age || 0,
              location: profile.current_city || 'Unknown location',
              image: profile.avatar_url || '',
              bio: profile.about_me || '',
              matchDate: formatMatchDate(match.matched_at),
              tags: [],
              isPending: match.status === 'pending',
              hasInitialMessage: match.status === 'accepted',
            });
          }
        });
      }
      
      // Process matches where user is user_id_2
      if (matches2?.length) {
        matches2.forEach(match => {
          if (match.profiles) {
            const profile = match.profiles;
            formattedProfiles.push({
              id: profile.id,
              name: profile.full_name || 'Anonymous',
              age: profile.age || 0,
              location: profile.current_city || 'Unknown location',
              image: profile.avatar_url || '',
              bio: profile.about_me || '',
              matchDate: formatMatchDate(match.matched_at),
              tags: [],
              isPending: match.status === 'pending',
              hasInitialMessage: match.status === 'accepted',
            });
          }
        });
      }

      setProfiles(formattedProfiles);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format match date to relative time
  const formatMatchDate = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    
    const matchDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - matchDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return matchDate.toLocaleDateString();
    }
  };

  // Separate profiles into accepted and pending
  const acceptedProfiles = profiles.filter(profile => !profile.isPending);
  const pendingProfiles = profiles.filter(profile => profile.isPending);

  // Filter profiles based on search query
  const filteredAcceptedProfiles = searchQuery 
    ? acceptedProfiles.filter(profile => {
        const searchText = searchQuery.toLowerCase();
        // Search by name
        const nameMatch = profile.name.toLowerCase().includes(searchText);
        // Search by bio
        const bioMatch = profile.bio.toLowerCase().includes(searchText);
        // Search by last message
        const lastMessageMatch = profile.messages && profile.messages.length > 0 && 
                              profile.messages[profile.messages.length - 1].toLowerCase().includes(searchText);
        
        return nameMatch || bioMatch || lastMessageMatch;
      }) 
    : acceptedProfiles;

  // Handler for accepting a match request
  const handleAcceptMatch = async (profileId: string) => {
    try {
      // Find the match in the database
      const { data: matchData, error: findError } = await supabase
        .from('profile_matches')
        .select('id, user_id_1, user_id_2')
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${profileId}),and(user_id_1.eq.${profileId},user_id_2.eq.${user.id})`)
        .single();

      if (findError) {
        console.error('Error finding match:', findError);
        throw new Error('Could not find the match request');
      }

      // Update the match status to accepted
      const { error: updateError } = await supabase
        .from('profile_matches')
        .update({ status: 'accepted' })
        .eq('id', matchData.id);

      if (updateError) {
        console.error('Error accepting match:', updateError);
        throw new Error('Failed to accept match request');
      }

      // Update the local state
      setProfiles(prevProfiles => 
        prevProfiles.map(profile => 
          profile.id === profileId 
            ? { ...profile, isPending: false, hasInitialMessage: true } 
            : profile
        )
      );

      toast({
        title: "Match Accepted",
        description: `You've connected with ${profiles.find(p => p.id === profileId)?.name || 'this user'}!`,
        className: "bg-gradient-to-r from-green-500 to-teal-500 text-white border-none",
      });
    } catch (error) {
      console.error('Error accepting match:', error);
      toast({
        title: "Error",
        description: "Failed to accept match request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler for declining a match request
  const handleDeclineMatch = async (profileId: string) => {
    try {
      // Find the match in the database
      const { data: matchData, error: findError } = await supabase
        .from('profile_matches')
        .select('id')
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${profileId}),and(user_id_1.eq.${profileId},user_id_2.eq.${user.id})`)
        .single();

      if (findError) {
        console.error('Error finding match:', findError);
        throw new Error('Could not find the match request');
      }

      // Delete the match
      const { error: deleteError } = await supabase
        .from('profile_matches')
        .delete()
        .eq('id', matchData.id);

      if (deleteError) {
        console.error('Error declining match:', deleteError);
        throw new Error('Failed to decline match request');
      }

      // Update the local state
      setProfiles(prevProfiles => 
        prevProfiles.filter(profile => profile.id !== profileId)
      );

      toast({
        title: "Match Declined",
        description: `You declined the match request from ${profiles.find(p => p.id === profileId)?.name || 'this user'}.`,
      });
    } catch (error) {
      console.error('Error declining match:', error);
      toast({
        title: "Error",
        description: "Failed to decline match request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[100vh] bg-[#FDF5EF] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500">Loading matches...</p>
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
            {/* Search input for messages tab */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
            
            {searchQuery && filteredAcceptedProfiles.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No matches found for "{searchQuery}"</p>
              </div>
            ) : (
              <MatchesList 
                profiles={filteredAcceptedProfiles} 
                showRequests={false}
              />
            )}
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
