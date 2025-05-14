
import { Profile } from "@/types/Profile";

export interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  tags: string[];
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
}

export const mapProfileToCardProps = (
  profile: Profile, 
  onSwipeLeft: (id: string) => void, 
  onSwipeRight: (id: string) => void
): ProfileCardProps => {
  // Extract move-in city (should be Berlin) or default
  const moveInCity = profile.move_in_city || "Berlin";
  
  // Determine if they have a relocation date/timeframe
  const isRelocating = Boolean(profile.move_in_city);
  
  return {
    id: profile.id,
    name: profile.full_name || "Anonymous",
    age: profile.age || 0,
    location: isRelocating ? `Moving to ${moveInCity}` : (profile.current_city || ""),
    bio: profile.about_me || "",
    image: profile.avatar_url || "",
    tags: profile.university ? [profile.university, "Moving to Berlin"] : ["Moving to Berlin"],
    onSwipeLeft,
    onSwipeRight
  };
};
