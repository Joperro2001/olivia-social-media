
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ChatErrorProps {
  onRetry: () => void;
  message?: string;
}

const ChatError: React.FC<ChatErrorProps> = ({ 
  onRetry, 
  message = "We're having trouble connecting to the chat service. This could be due to network issues or server problems." 
}) => {
  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h3 className="font-semibold text-xl mb-2">Connection Error</h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex flex-col space-y-3">
          <Button onClick={onRetry} className="w-full inline-flex items-center justify-center bg-purple-400 hover:bg-purple-500">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatError;
