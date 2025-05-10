
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Calendar, User, Settings, ListCheck } from "lucide-react";

const NavigationBar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      name: "Olivia",
      icon: MessageCircle,
      path: "/",
    },
    {
      name: "Besties",
      icon: Heart,
      path: "/besties",
    },
    {
      name: "Social",
      icon: Calendar,
      path: "/social",
    },
    {
      name: "Matches",
      icon: ListCheck,
      path: "/my-matches",
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 glassmorphism z-50 border-t border-primary/10">
      <nav className="h-full max-w-md mx-auto px-2">
        <ul className="flex h-full items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.name} className="w-1/6 h-full">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center h-full transition-all ${
                    isActive ? "active-nav-item" : "text-gray-400"
                  }`}
                >
                  <item.icon
                    size={24}
                    className={`transition-all duration-300 ${
                      isActive ? "text-primary scale-110" : "scale-100"
                    }`}
                  />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default NavigationBar;
