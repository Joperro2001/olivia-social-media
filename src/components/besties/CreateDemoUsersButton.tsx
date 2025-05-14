
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConfig } from "@/hooks/useConfig";
import { Loader } from 'lucide-react';

const CreateDemoUsersButton: React.FC = () => {
  const { user } = useAuth();
  const { apiBaseUrl } = useConfig();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createDemoUsers = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create demo users",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const response = await fetch(`${apiBaseUrl}/create-demo-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create demo users");
      }

      const result = await response.json();
      
      toast({
        title: "Demo Users Created",
        description: `Successfully created ${result.success} out of ${result.total} demo users`,
        variant: result.failed > 0 ? "destructive" : "default",
      });
      
      // Reload the page to refresh user profiles
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Error creating demo users:", error);
      toast({
        title: "Error Creating Demo Users",
        description: error.message || "There was a problem creating demo users",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={createDemoUsers}
      disabled={isCreating}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isCreating ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : null}
      {isCreating ? "Creating Demo Users..." : "Create Demo Users"}
    </Button>
  );
};

export default CreateDemoUsersButton;
