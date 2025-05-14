
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const CreateDemoUsersButton = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateDemoUsers = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create demo users",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-users', {
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.errors && data.errors.length > 0) {
        console.warn("Some users could not be created:", data.errors);
      }

      toast({
        title: "Demo users created!",
        description: `Created ${data.success} out of ${data.total} demo users successfully`,
        variant: "default",
      });

      // Trigger refresh if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating demo users:", error);
      toast({
        title: "Error creating demo users",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreateDemoUsers}
      disabled={isLoading}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      <span>{isLoading ? "Creating Users..." : "Create Demo Users"}</span>
    </Button>
  );
};

export default CreateDemoUsersButton;
