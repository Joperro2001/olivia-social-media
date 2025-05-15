
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Profile } from "@/types/Profile";

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
    </>
  );
};

export default ProfileForm;
export { formSchema };
