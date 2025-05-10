
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import OliviaChat from "./pages/OliviaChat";
import BestiesPage from "./pages/BestiesPage";
import SocialPage from "./pages/SocialPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import MyMatchesPage from "./pages/MyMatchesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><OliviaChat /></AppLayout>} />
          <Route path="/besties" element={<AppLayout><BestiesPage /></AppLayout>} />
          <Route path="/social" element={<AppLayout><SocialPage /></AppLayout>} />
          <Route path="/matches" element={<AppLayout><MyMatchesPage /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
