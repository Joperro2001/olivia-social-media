
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProfileAvatar = (updateProfile: (data: { avatar_url: string }) => Promise<boolean>) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user || !file) return null;

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the file
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      if (data?.publicUrl) {
        // Update the profile in the database
        await updateProfile({ avatar_url: data.publicUrl });
        return data.publicUrl;
      }
      return null;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    uploadAvatar
  };
};
