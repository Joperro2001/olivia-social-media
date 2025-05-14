
import React from "react";
import NavigationBar from "./NavigationBar";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes('/chat/');

  return (
    <div className="relative min-h-full bg-[#FDF5EF]">
      <main className={`h-full ${!isChatPage ? 'pb-20' : ''}`}>{children}</main>
      {!isChatPage && <NavigationBar />}
    </div>
  );
};

export default AppLayout;
