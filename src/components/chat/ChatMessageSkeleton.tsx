
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ChatMessageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col space-y-3 w-full max-w-md mx-auto">
      {/* Left side message skeleton */}
      <div className="flex items-start space-x-2 self-start">
        <Skeleton className="h-8 w-8 rounded-full" /> 
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-64 rounded-md" />
        </div>
      </div>
      
      {/* Right side message skeleton */}
      <div className="flex items-end space-x-2 self-end flex-row-reverse">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col space-y-2 items-end">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ChatMessageSkeleton;
