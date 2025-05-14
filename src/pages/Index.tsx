
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If user is logged in, redirect to Olivia chat
        navigate("/");
      } else {
        // If no user, redirect to sign in
        navigate("/signin");
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return null;
};

export default Index;
