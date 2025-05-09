
import React from "react";
import NavigationBar from "./NavigationBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-full pb-20">
      <main className="container mx-auto px-4 py-4">{children}</main>
      <NavigationBar />
    </div>
  );
};

export default AppLayout;
