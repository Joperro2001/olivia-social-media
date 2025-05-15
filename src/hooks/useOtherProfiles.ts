
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/Profile";

export const useOtherProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [userMoveInCity, setUserMoveInCity] = useState<string | null>(null);
  const [originalProfiles, setOriginalProfiles] = useState<Profile[]>([]);
  const [filterByCity, setFilterByCity] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true
  });
  const [viewedProfiles, setViewedProfiles] = useState<Set<string>>(new Set());

  const fetchCurrentUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("move_in_city")
      .eq("id", user.id)
      .single();
      
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return data?.move_in_city || null;
  };

  const fetchOtherProfiles = async (resetPage = true) => {
    try {
      setIsLoading(true);
      
      // If resetting page, reset pagination state
      if (resetPage) {
        setPagination({
          page: 1,
          pageSize: 10,
          hasMore: true
        });
      }
      
      // First, get the current user's move_in_city or set a default city
      let moveInCity = "Berlin"; // Default to Berlin
      
      if (user) {
        const userMoveInCity = await fetchCurrentUserProfile();
        if (userMoveInCity) {
          moveInCity = userMoveInCity;
        }
      }
      
      setUserMoveInCity(moveInCity);
      console.log(`User's city: ${moveInCity}`);
      console.log(`Filter by city enabled: ${filterByCity}`);
      
      // Get all profiles - no city filtering initially
      let query = supabase
        .from("profiles")
        .select("*");

      // Only exclude the current user if logged in
      if (user) {
        query = query.neq("id", user.id);
        
        // Get the IDs of users the current user has already matched with
        const { data: matchesAsUser1, error: matchError1 } = await supabase
          .from('profile_matches')
          .select('user_id_2')
          .eq('user_id_1', user.id);

        const { data: matchesAsUser2, error: matchError2 } = await supabase
          .from('profile_matches')
          .select('user_id_1')
          .eq('user_id_2', user.id);
        
        if (matchError1 || matchError2) {
          console.error("Error fetching matches:", matchError1 || matchError2);
        } else {
          // Extract all user IDs that should be excluded
          const matchedUserIds = [
            ...(matchesAsUser1 ? matchesAsUser1.map(match => match.user_id_2) : []),
            ...(matchesAsUser2 ? matchesAsUser2.map(match => match.user_id_1) : [])
          ];
          
          // Only add the "not in" filter if there are matched users to exclude
          if (matchedUserIds.length > 0) {
            console.log("Excluding matched users:", matchedUserIds);
            query = query.not('id', 'in', `(${matchedUserIds.join(',')})`);
          }
        }
      }
      
      // Only filter by move_in_city if filterByCity is enabled
      if (filterByCity && moveInCity) {
        console.log(`Filtering by move_in_city: ${moveInCity}`);
        query = query.eq("move_in_city", moveInCity);
      }
      
      // Apply pagination with range
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log(`Profiles fetched: ${data ? data.length : 0}`);
      
      if (data && data.length > 0) {
        console.log("Profiles found:", data);
        
        // Properly type-cast the relocation_status field for each profile
        const typedProfiles: Profile[] = data.map(profile => ({
          ...profile,
          relocation_status: profile.relocation_status as Profile["relocation_status"]
        }));
        
        // Check if we're loading more pages or resetting
        if (resetPage) {
          setProfiles(typedProfiles);
          setOriginalProfiles(typedProfiles);
        } else {
          // Append to existing profiles, avoiding duplicates
          const existingIds = new Set(profiles.map(p => p.id));
          const newProfiles = [...profiles, ...typedProfiles.filter(p => !existingIds.has(p.id))];
          setProfiles(newProfiles);
          setOriginalProfiles(newProfiles);
        }
        
        // Update hasMore flag - if we got fewer than pageSize, there are no more
        setPagination(prev => ({
          ...prev,
          hasMore: data.length >= pagination.pageSize
        }));
      } else {
        // If no profiles found or we've loaded all profiles, use mockData as fallback
        console.log(`No${filterByCity ? ` more ${moveInCity}` : ''} profiles found${resetPage ? ', using mock data instead' : ''}`);
        
        if (resetPage) {
          // Import mock data from bestiesMockData
          import("@/data/bestiesMockData").then(({ profiles: mockProfiles }) => {
            console.log("Using mock profiles:", mockProfiles);
            
            // Convert mock data to Profile type
            const convertedProfiles: Profile[] = mockProfiles.map((mock, index) => ({
              id: mock.id,
              full_name: mock.name,
              age: mock.age,
              current_city: mock.location.split(",")[1]?.trim() || "",
              move_in_city: "Berlin", // Assume all mock profiles are moving to Berlin
              about_me: mock.bio,
              avatar_url: mock.image,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              nationality: "",
              university: "",
              relocation_status: "planning",
              relocation_interests: mock.tags
            }));
            
            setProfiles(convertedProfiles);
            setOriginalProfiles(convertedProfiles);
          });
        }
        
        // No more pages
        setPagination(prev => ({
          ...prev,
          hasMore: false
        }));
      }
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
      
      // Use mock data as fallback if there's an error
      import("@/data/bestiesMockData").then(({ profiles: mockProfiles }) => {
        console.log("Error occurred, using mock profiles:", mockProfiles);
        
        // Convert mock data to Profile type
        const convertedProfiles: Profile[] = mockProfiles.map((mock) => ({
          id: mock.id,
          full_name: mock.name,
          age: mock.age,
          current_city: mock.location.split(",")[1]?.trim() || "",
          move_in_city: "Berlin", 
          about_me: mock.bio,
          avatar_url: mock.image,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          nationality: "",
          university: "",
          relocation_status: "planning",
          relocation_interests: mock.tags
        }));
        
        setProfiles(convertedProfiles);
        setOriginalProfiles(convertedProfiles);
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load more profiles
  const loadMoreProfiles = () => {
    if (!pagination.hasMore || isLoading) return;
    
    setPagination(prev => ({
      ...prev,
      page: prev.page + 1
    }));
    
    fetchOtherProfiles(false);
  };

  // Function to set custom profile ordering
  const setProfilesOrder = (orderedProfileIds: string[]) => {
    if (!orderedProfileIds || orderedProfileIds.length === 0) return;
    
    console.log("Setting profile order with IDs:", orderedProfileIds);
    console.log("Original profiles:", originalProfiles);
    
    // Create a map for O(1) lookups
    const profileMap = originalProfiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, Profile>);
    
    // Order profiles based on the provided ID ordering
    const orderedProfiles = orderedProfileIds
      .map(id => profileMap[id])
      .filter(profile => !!profile); // Remove any undefined profiles
    
    console.log("Ordered profiles after mapping:", orderedProfiles);
    
    // Add any profiles that might not be in the ordered list
    const orderedIds = new Set(orderedProfileIds);
    const remainingProfiles = originalProfiles.filter(profile => !orderedIds.has(profile.id));
    
    const finalProfiles = [...orderedProfiles, ...remainingProfiles];
    console.log("Final profile order:", finalProfiles);
    
    setProfiles(finalProfiles);
  };

  // Reset to original order
  const resetOrder = () => {
    setProfiles([...originalProfiles]);
  };

  // Toggle city filtering
  const toggleCityFiltering = (enabled: boolean) => {
    console.log(`Toggling city filtering: ${enabled}`);
    setFilterByCity(enabled);
    // Re-fetch profiles with new filter setting
    fetchOtherProfiles();
  };
  
  // Mark profile as viewed
  const markProfileViewed = (profileId: string) => {
    setViewedProfiles(prev => new Set(prev).add(profileId));
  };
  
  // Get unviewed profiles count
  const getUnviewedCount = () => {
    return profiles.filter(p => !viewedProfiles.has(p.id)).length;
  };
  
  // Reset viewed profiles
  const resetViewedProfiles = () => {
    setViewedProfiles(new Set());
  };

  useEffect(() => {
    console.log("useOtherProfiles: initializing profile fetch");
    fetchOtherProfiles();
    
    // Re-fetch profiles when user auth state changes
  }, [user]);

  return {
    profiles,
    isLoading,
    userMoveInCity,
    refetchProfiles: fetchOtherProfiles,
    setProfilesOrder,
    resetOrder,
    toggleCityFiltering,
    filterByCity,
    loadMoreProfiles,
    hasMoreProfiles: pagination.hasMore,
    markProfileViewed,
    getUnviewedCount,
    resetViewedProfiles,
    viewedProfiles
  };
};
