
import React, { useState } from "react";
import MatchesList from "@/components/besties/MatchesList";
import SearchInput from "@/components/besties/SearchInput";
import { MatchProfile } from "@/utils/matchHelpers";

interface MatchesTabContentProps {
  profiles: MatchProfile[];
}

const MatchesTabContent: React.FC<MatchesTabContentProps> = ({ profiles }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
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
    <>
      <SearchInput 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search messages..."
      />
      
      {searchQuery && filteredProfiles.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No matches found for "{searchQuery}"</p>
        </div>
      ) : (
        <MatchesList 
          profiles={filteredProfiles} 
          showRequests={false}
        />
      )}
    </>
  );
};

export default MatchesTabContent;
