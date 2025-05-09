
import React from "react";
import NavigationBar from "./NavigationBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-full">
      <main className="h-full">{children}</main>
      <NavigationBar />
    </div>
  );
};

export default AppLayout;
