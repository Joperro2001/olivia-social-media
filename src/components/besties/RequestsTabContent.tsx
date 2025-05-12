
import React from "react";
import MatchesList from "@/components/besties/MatchesList";
import { MatchProfile } from "@/utils/matchHelpers";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface RequestsTabContentProps {
  profiles: MatchProfile[];
  onAcceptMatch: (profileId: string) => Promise<void>;
  onDeclineMatch: (profileId: string) => Promise<void>;
  isLoading?: boolean;
}

const RequestsTabContent: React.FC<RequestsTabContentProps> = ({ 
  profiles,
  onAcceptMatch,
  onDeclineMatch,
  isLoading = false
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading requests..." />;
  }

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
