
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ChatErrorProps {
  onRetry: () => void;
}

const ChatError: React.FC<ChatErrorProps> = ({ onRetry }) => {
  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
        <h3 className="font-semibold text-lg mb-2">Connection Error</h3>
        <p className="text-gray-600 mb-4">
          We're having trouble connecting to the chat service. This could be due to network issues or server problems.
        </p>
        <Button onClick={onRetry} className="inline-flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    </div>
  );
};

export default ChatError;
