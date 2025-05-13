
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// Chat message skeleton loader component
const ChatMessageSkeleton = ({ isUser = false }: { isUser?: boolean }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    {!isUser && (
      <Skeleton className="h-8 w-8 rounded-full mr-2" />
    )}
    <div className={`max-w-[75%] ${isUser ? 'bg-primary/20' : 'bg-gray-200/50'} rounded-lg p-3`}>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-4 w-48" />
    </div>
  </div>
);

const ChatLoadingSkeleton: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <LoadingSpinner message="Loading chat..." />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <ChatMessageSkeleton />
        <ChatMessageSkeleton isUser={true} />
        <ChatMessageSkeleton />
      </div>
    </div>
  );
};

export default ChatLoadingSkeleton;
