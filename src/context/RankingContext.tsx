
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Profile } from "@/types/Profile";

interface RankingContextType {
  rankedProfiles: Profile[];
  setRankedProfiles: (profiles: Profile[]) => void;
  isAIRankingActive: boolean;
  setIsAIRankingActive: (active: boolean) => void;
}

const RankingContext = createContext<RankingContextType | undefined>(undefined);

export const RankingProvider = ({ children }: { children: ReactNode }) => {
  const [rankedProfiles, setRankedProfiles] = useState<Profile[]>([]);
  const [isAIRankingActive, setIsAIRankingActive] = useState(false);

  return (
    <RankingContext.Provider
      value={{
        rankedProfiles,
        setRankedProfiles,
        isAIRankingActive,
        setIsAIRankingActive,
      }}
    >
      {children}
    </RankingContext.Provider>
  );
};

export const useRanking = (): RankingContextType => {
  const context = useContext(RankingContext);
  if (context === undefined) {
    throw new Error("useRanking must be used within a RankingProvider");
  }
  return context;
};
