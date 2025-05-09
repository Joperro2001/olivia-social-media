
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-5xl font-bold mb-2">404</div>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Go back home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
