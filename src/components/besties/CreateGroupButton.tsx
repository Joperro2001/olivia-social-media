
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateGroupButton: React.FC = () => {
  const { toast } = useToast();

  return (
    <div className="text-center py-4 mt-4">
      <Button 
        variant="outline"
        className="mb-2"
        onClick={() => {
          toast({
            title: "Creating a new group",
            description: "You'll be able to create your own group in the full version!",
          });
        }}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Create New Group
      </Button>
      
      <p className="text-sm text-gray-500 mt-1">
        All group matches work through double opt-in to ensure everyone's comfort
      </p>
    </div>
  );
};

export default CreateGroupButton;
