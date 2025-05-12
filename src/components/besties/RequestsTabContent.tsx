
import React from "react";
import MatchesList from "@/components/besties/MatchesList";
import { MatchProfile } from "@/utils/matchHelpers";

interface RequestsTabContentProps {
  profiles: MatchProfile[];
  onAcceptMatch: (profileId: string) => Promise<void>;
  onDeclineMatch: (profileId: string) => Promise<void>;
}

const RequestsTabContent: React.FC<RequestsTabContentProps> = ({ 
  profiles,
  onAcceptMatch,
  onDeclineMatch
}) => {
  return (
    <MatchesList 
      profiles={profiles}
      showRequests={true}
      onAcceptMatch={onAcceptMatch}
      onDeclineMatch={onDeclineMatch}
    />
  );
};

export default RequestsTabContent;
