
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";

// Import our components
import ProfileEditHeader from "@/components/profile/ProfileEditHeader";
import ProfileImageSection from "@/components/profile/ProfileImageSection";
import ProfileForm, { formSchema, ProfileFormValues } from "@/components/profile/ProfileForm";
import InterestSelectionSection from "@/components/profile/InterestSelectionSection";

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, interests, updateProfile, uploadAvatar, addInterest, removeInterest, isLoading, fetchProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const MAX_INTERESTS = 4;
  const [formInitialized, setFormInitialized] = useState(false);

  // Initialize form with improved validation
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      age: 25,
      university: "",
      nationality: "",
      current_city: "",
      move_in_city: "",
      about_me: "",
    },
    mode: "onBlur", // Change to onBlur for a better user experience
  });
  
  // Fetch profile data when component mounts if needed
  useEffect(() => {
    if (user && !profile) {
      console.log("Fetching profile because no profile data exists");
      fetchProfile();
    }
  }, [user, profile, fetchProfile]);
  
  // Load profile data when available - but only once to prevent re-initialization
  useEffect(() => {
    if (profile && !formInitialized) {
      console.log("Initializing form with profile data:", profile);
      form.reset({
        full_name: profile.full_name || "",
        age: profile.age ? Number(profile.age) : 25,
        university: profile.university || "",
        nationality: profile.nationality || "",
        current_city: profile.current_city || "",
        move_in_city: profile.move_in_city || "",
        about_me: profile.about_me || "",
      });
      
      // Set initially selected interests
      if (profile.interests && profile.interests.length > 0) {
        setSelectedInterests(profile.interests);
      } else if (interests && interests.length > 0) {
        setSelectedInterests(interests.map(interest => interest.interest));
      }
      
      setFormInitialized(true);
      console.log("Form initialized with profile data");
    }
  }, [profile, interests, form, formInitialized]);

  const syncInterests = async () => {
    try {
      console.log("Syncing interests:", selectedInterests);
      console.log("Current interests in DB:", interests);
      
      // Remove interests that are no longer selected
      const interestsToRemove = interests.filter(
        interest => !selectedInterests.includes(interest.interest)
      );
      
      for (const interest of interestsToRemove) {
        console.log("Removing interest:", interest);
        await removeInterest(interest.id);
      }
      
      // Add new interests
      const existingInterests = interests.map(i => i.interest);
      const interestsToAdd = selectedInterests.filter(
        interest => !existingInterests.includes(interest)
      );
      
      for (const interest of interestsToAdd) {
        console.log("Adding interest:", interest);
        await addInterest(interest);
      }
      
      return true;
    } catch (error) {
      console.error("Error syncing interests:", error);
      toast({
        title: "Error saving interests",
        description: "There was a problem saving your interests. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    console.log("Form submitted with data:", data);
    setIsSaving(true);
    
    try {
      // First validate all form fields
      const validationResult = formSchema.safeParse(data);
      
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error);
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form before submitting.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // First update profile
      console.log("Calling updateProfile with:", data);
      const profileUpdated = await updateProfile(data);
      console.log("Profile update result:", profileUpdated);
      
      // Then sync interests
      const interestsUpdated = await syncInterests();
      console.log("Interests update result:", interestsUpdated);
      
      if (profileUpdated && interestsUpdated) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        // Navigate back to profile page
        navigate("/profile");
      } else {
        throw new Error("Failed to update profile or interests");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: error.message || "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[100vh] bg-[#FDF5EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-10">
          {/* Header with back button */}
          <ProfileEditHeader 
            onSave={form.handleSubmit(onSubmit)}
            onBack={() => navigate("/profile")}
            isSaving={isSaving}
          />

          {/* Profile Image */}
          <ProfileImageSection profile={profile} uploadAvatar={uploadAvatar} />

          <div className="px-4 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Form Fields */}
                <ProfileForm profile={profile} form={form} />
                
                {/* Interests Selection */}
                <InterestSelectionSection 
                  selectedInterests={selectedInterests}
                  setSelectedInterests={setSelectedInterests}
                  maxInterests={MAX_INTERESTS}
                />
              </form>
            </Form>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditProfilePage;
