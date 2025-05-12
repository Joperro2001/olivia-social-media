import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { interestOptions } from "@/data/interestOptions";

// Define form validation schema
const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(18, "Must be at least 18 years old").max(100, "Age cannot exceed 100"),
  university: z.string().optional(),
  nationality: z.string().min(2, "Nationality is required"),
  current_city: z.string().min(2, "Current city is required"),
  move_in_city: z.string().min(2, "Moving to city is required"),
  about_me: z.string().min(10, "Please write at least 10 characters about yourself"),
});

type FormValues = z.infer<typeof formSchema>;

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, interests, updateProfile, addInterest, removeInterest, isLoading } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const MAX_INTERESTS = 4;

  // Initialize form with validation
  const form = useForm<FormValues>({
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
  });
  
  // Load profile data when available
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        age: profile.age || 25,
        university: profile.university || "",
        nationality: profile.nationality || "",
        current_city: profile.current_city || "",
        move_in_city: profile.move_in_city || "",
        about_me: profile.about_me || "",
      });
    }
    
    // Set initially selected interests
    if (interests && interests.length > 0) {
      setSelectedInterests(interests.map(interest => interest.interest));
    }
  }, [profile, interests, form]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        // Only add if we haven't reached the maximum
        if (prev.length < MAX_INTERESTS) {
          return [...prev, interest];
        }
        // Show toast notification if max limit reached
        toast({
          title: "Maximum interests reached",
          description: `You can select up to ${MAX_INTERESTS} interests.`,
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  const syncInterests = async () => {
    // Remove interests that are no longer selected
    const interestsToRemove = interests.filter(
      interest => !selectedInterests.includes(interest.interest)
    );
    
    for (const interest of interestsToRemove) {
      await removeInterest(interest.id);
    }
    
    // Add new interests
    const existingInterests = interests.map(i => i.interest);
    const interestsToAdd = selectedInterests.filter(
      interest => !existingInterests.includes(interest)
    );
    
    for (const interest of interestsToAdd) {
      await addInterest(interest);
    }
    
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      // First update profile
      const profileUpdated = await updateProfile(data);
      
      // Then sync interests
      const interestsUpdated = await syncInterests();
      
      if (profileUpdated && interestsUpdated) {
        // Navigate back to profile page
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
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
          <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-10 bg-[#FDF5EF]">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/profile")}
                className="mr-2"
              >
                <ChevronLeft size={20} />
              </Button>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
            </div>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              className="flex items-center gap-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </Button>
          </div>

          <div className="px-4 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* User Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border space-y-4">
                  <h3 className="font-semibold text-lg">User Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University</FormLabel>
                        <FormControl>
                          <Input placeholder="Your university" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input placeholder="Your nationality" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="current_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current City</FormLabel>
                        <FormControl>
                          <Input placeholder="Your current city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="move_in_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moving To</FormLabel>
                        <FormControl>
                          <Input placeholder="City you're moving to" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* About Me */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border space-y-4">
                  <h3 className="font-semibold text-lg">About Me</h3>
                  
                  <FormField
                    control={form.control}
                    name="about_me"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Interests - Updated with max limit indication */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border space-y-4">
                  <h3 className="font-semibold text-lg">Interests</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Select up to {MAX_INTERESTS} interests from the options below
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedInterests.length > 0 ? (
                      selectedInterests.map((interest) => (
                        <Badge 
                          key={interest}
                          variant="secondary" 
                          className="bg-lavender-light text-primary-dark"
                        >
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No interests selected yet.</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <div 
                        key={interest} 
                        className="flex items-center space-x-2"
                      >
                        <Checkbox 
                          id={`interest-${interest}`} 
                          checked={selectedInterests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                          disabled={!selectedInterests.includes(interest) && selectedInterests.length >= MAX_INTERESTS}
                        />
                        <label 
                          htmlFor={`interest-${interest}`}
                          className={`text-sm cursor-pointer ${
                            !selectedInterests.includes(interest) && selectedInterests.length >= MAX_INTERESTS 
                              ? "text-gray-400" 
                              : ""
                          }`}
                        >
                          {interest}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditProfilePage;
