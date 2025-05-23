
import React from "react";
import { Avatar } from "@/components/ui/avatar";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-2 mb-4 justify-start">
      <Avatar className="w-8 h-8">
        <img
          src="/lovable-uploads/eec42500-64ac-429a-b4d6-e87431861420.png"
          alt="Olivia"
          className="w-full h-full object-cover"
        />
      </Avatar>
      <div className="typing-indicator">
        <span className="typing-dot" style={{ animationDelay: "0s" }}></span>
        <span className="typing-dot" style={{ animationDelay: "0.2s" }}></span>
        <span className="typing-dot" style={{ animationDelay: "0.4s" }}></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
