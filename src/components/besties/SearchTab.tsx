
import React from "react";
import { Search } from "lucide-react";

const SearchTab: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <Search className="h-10 w-10 mb-2 opacity-50" />
      <h3 className="text-lg font-medium">Search Coming Soon</h3>
      <p className="text-sm text-gray-500 mt-1">
        Advanced search will be available in the upcoming update
      </p>
    </div>
  );
};

export default SearchTab;
