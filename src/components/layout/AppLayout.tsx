
import React from "react";
import NavigationBar from "./NavigationBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-full bg-gradient-to-br from-secondary/30 to-primary/20">
      <main className="h-full pb-20">{children}</main>
      <NavigationBar />
    </div>
  );
};

export default AppLayout;
