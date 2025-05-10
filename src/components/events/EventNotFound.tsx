
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EventNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FDF5EF] p-4">
      <h1 className="text-2xl font-bold mb-4">Event not found</h1>
      <Button onClick={() => navigate("/social")}>Back to Events</Button>
    </div>
  );
};

export default EventNotFound;
