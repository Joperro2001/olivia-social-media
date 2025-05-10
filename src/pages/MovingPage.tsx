
import React from "react";

const MovingPage: React.FC = () => {
  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">Moving</h1>
      </div>
      
      <div className="px-4 flex flex-col items-center justify-center h-[60vh]">
        <p className="text-gray-500 text-center">
          Coming soon!
        </p>
      </div>
    </div>
  );
};

export default MovingPage;
