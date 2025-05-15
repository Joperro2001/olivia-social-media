
import { useProfileData } from "./profile/useProfileData";
import { useProfileUpdates } from "./profile/useProfileUpdates";
import { useProfileAvatar } from "./profile/useProfileAvatar";
import { useProfileInterests } from "./profile/useProfileInterests";
import { Profile } from "@/types/Profile";
import { Interest } from "@/types/ProfileInterest";

export type { Interest };

export const useProfile = () => {
  const { 
    profile, 
    interests, 
    isLoading, 
    fetchProfile,
    setProfile,
    setInterests
  } = useProfileData();
  
  const { updateProfile } = useProfileUpdates(profile, setProfile);
  const { uploadAvatar } = useProfileAvatar(updateProfile);
  const { addInterest, removeInterest } = useProfileInterests(interests, setInterests);

  // Convert interests from Interest[] to string[] and add to profile
  const profileWithInterests = profile ? {
    ...profile,
    interests: interests.map(i => i.interest)
  } : null;

  console.log("useProfile hook returning profileWithInterests:", profileWithInterests);

  return {
    profile: profileWithInterests,
    interests,
    isLoading,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    addInterest,
    removeInterest,
  };
};
