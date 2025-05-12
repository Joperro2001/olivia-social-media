
import React, { useState } from "react";
import MatchesList from "@/components/besties/MatchesList";
import SearchInput from "@/components/besties/SearchInput";
import { useAuth } from "@/context/AuthContext";
import { MatchProfile } from "@/utils/matchHelpers";

interface MatchesTabContentProps {
  profiles: MatchProfile[];
}

const MatchesTabContent: React.FC<MatchesTabContentProps> = ({ profiles }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  
  // Filter profiles based on search query
  const filteredProfiles = searchQuery 
    ? profiles.filter(profile => {
        const searchText = searchQuery.toLowerCase();
        // Search by name
        const nameMatch = profile.name.toLowerCase().includes(searchText);
        // Search by bio
        const bioMatch = profile.bio?.toLowerCase().includes(searchText);
        // Search by last message
        const lastMessageMatch = profile.messages && profile.messages.length > 0 && 
                              profile.messages[profile.messages.length - 1].toLowerCase().includes(searchText);
        
        return nameMatch || bioMatch || lastMessageMatch;
      }) 
    : profiles;

  return (
    <div className="flex flex-col h-full">
      <div className="px-1 mb-2">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search messages..."
        />
      </div>
      
      {!user ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Please log in to view your matches</p>
        </div>
      ) : searchQuery && filteredProfiles.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No matches found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <MatchesList 
            profiles={filteredProfiles} 
            showRequests={false}
          />
        </div>
      )}
    </div>
  );
};

export default MatchesTabContent;
