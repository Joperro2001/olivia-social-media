
import React from "react";
import NavigationBar from "./NavigationBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-full bg-[#FDF5EF]">
      <main className="h-full pb-20">{children}</main>
      <NavigationBar />
    </div>
  );
};

export default AppLayout;
