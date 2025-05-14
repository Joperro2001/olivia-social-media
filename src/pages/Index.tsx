
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import CreateDemoUsersButton from "@/components/besties/CreateDemoUsersButton";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If user is logged in, redirect to Besties page instead of Olivia chat
        navigate("/besties");
      } else {
        // If no user, redirect to sign in
        navigate("/signin");
      }
    }
  }, [user, isLoading, navigate]);

  const handleSuccess = () => {
    toast({
      title: "Demo users created successfully",
      description: "You can now see them in the Besties page",
    });
    navigate("/besties");
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome to Besties</h1>
      {user && (
        <div className="mb-4">
          <CreateDemoUsersButton onSuccess={handleSuccess} />
        </div>
      )}
      <p className="text-center text-gray-600">
        {user ? "Creating demo users..." : "Please sign in to continue"}
      </p>
    </div>
  );
};

export default Index;
