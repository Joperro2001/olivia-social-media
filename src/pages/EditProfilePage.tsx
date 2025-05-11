import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(18, "Must be at least 18 years old").max(100, "Age cannot exceed 100"),
  university: z.string().optional(),
  nationality: z.string().min(2, "Nationality is required"),
  currentCity: z.string().min(2, "Current city is required"),
  moveInCity: z.string().min(2, "Moving to city is required"),
  aboutMe: z.string().min(10, "Please write at least 10 characters about yourself"),
});

type FormValues = z.infer<typeof formSchema>;

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interests, setInterests] = useState<string[]>([
    "Technology", "Hiking", "Photography", "Local Cuisine", "Coworking", "Cycling"
  ]);
  const [newInterest, setNewInterest] = useState<string>("");

  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Alex Taylor",
      age: 27,
      university: "LSE",
      nationality: "British",
      currentCity: "London",
      moveInCity: "Berlin",
      aboutMe: "Tech professional exploring Berlin for 6 months. Looking to connect with fellow expats, find great workspaces, and explore the local culture.",
    },
  });
  
  // Load saved profile data from localStorage if available
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      form.reset(profileData);
    }
    
    // Load interests if available
    const savedInterests = localStorage.getItem("userInterests");
    if (savedInterests) {
      setInterests(JSON.parse(savedInterests));
    }
  }, [form]);

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      const updatedInterests = [...interests, newInterest.trim()];
      setInterests(updatedInterests);
      localStorage.setItem("userInterests", JSON.stringify(updatedInterests));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    const updatedInterests = interests.filter(item => item !== interest);
    setInterests(updatedInterests);
    localStorage.setItem("userInterests", JSON.stringify(updatedInterests));
  };

  const onSubmit = (data: FormValues) => {
    // Save profile data to localStorage
    localStorage.setItem("userProfile", JSON.stringify(data));
    localStorage.setItem("matchedCity", data.moveInCity);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    
    // Navigate back to profile page
    navigate("/profile");
  };

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
            >
              <Save size={16} />
              Save
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
                    name="name"
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
                    name="currentCity"
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
                    name="moveInCity"
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
                    name="aboutMe"
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
                
                {/* Interests */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border space-y-4">
                  <h3 className="font-semibold text-lg">Interests</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {interests.map((interest) => (
                      <Badge 
                        key={interest}
                        variant="secondary" 
                        className="bg-lavender-light text-primary-dark hover:bg-lavender flex items-center gap-1"
                        onClick={() => removeInterest(interest)}
                      >
                        {interest}
                        <span className="ml-1 cursor-pointer">×</span>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add new interest"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addInterest}>Add</Button>
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
