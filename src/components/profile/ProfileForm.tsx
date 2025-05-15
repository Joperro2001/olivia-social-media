
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Profile } from "@/types/Profile";

// Define form validation schema with improved error messages and validation rules
const formSchema = z.object({
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(18, "You must be at least 18 years old to use this platform")
    .max(100, "Please enter a valid age"),
  university: z.string()
    .optional()
    .transform(val => val === "" ? undefined : val),
  nationality: z.string()
    .min(2, "Please specify your nationality")
    .max(50, "Nationality name is too long"),
  current_city: z.string()
    .min(2, "Please specify your current city")
    .max(100, "City name is too long"),
  move_in_city: z.string()
    .min(2, "Please specify the city you're moving to")
    .max(100, "City name is too long"),
  about_me: z.string()
    .min(10, "Please write at least 10 characters about yourself")
    .max(1000, "Bio cannot exceed 1000 characters"),
});

export type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  profile: Profile | null;
  form: ReturnType<typeof useForm<ProfileFormValues>>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ form }) => {
  return (
    <>
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
              <FormDescription>
                Your name as you want it to appear on your profile
              </FormDescription>
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
                <Input 
                  type="number"
                  placeholder="Your age"
                  {...field}
                  onChange={e => {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : Number(value));
                  }}
                />
              </FormControl>
              <FormDescription>
                You must be at least 18 years old to use this platform
              </FormDescription>
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
                <Input placeholder="Your university (optional)" {...field} />
              </FormControl>
              <FormDescription>
                Optional: Add your university or educational institution
              </FormDescription>
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
              <FormDescription>
                Your country of origin or citizenship
              </FormDescription>
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
              <FormDescription>
                Where you currently live
              </FormDescription>
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
              <FormDescription>
                The city you're relocating to
              </FormDescription>
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
                  placeholder="Tell us about yourself, your interests, and what you're looking for in your new city" 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Share a bit about yourself (10-1000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default ProfileForm;
export { formSchema };
