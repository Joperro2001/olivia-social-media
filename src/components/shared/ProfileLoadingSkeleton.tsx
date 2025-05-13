
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileLoadingSkeleton: React.FC = () => {
  return (
    <div className="h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex flex-col">
        {/* Nav skeleton */}
        <div className="flex items-center justify-between px-4 py-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        {/* Avatar and name skeleton */}
        <div className="flex flex-col items-center mt-2">
          <Skeleton className="w-28 h-28 rounded-full" />
          <div className="mt-4 flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-36" />
          </div>
        </div>
        
        {/* Cards skeleton */}
        <div className="mt-4 space-y-6 px-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default ProfileLoadingSkeleton;
