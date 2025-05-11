
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
import MyGroupsPage from "./pages/MyGroupsPage";
import CityPage from "./pages/CityPage";
import MyCityMatchPage from "./pages/MyCityMatchPage";
import MyCityPackerPage from "./pages/MyCityPackerPage";
import MyCityExplorerPage from "./pages/MyCityExplorerPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import EventDetailsPage from "./pages/EventDetailsPage";
import SavedEventsPage from "./pages/SavedEventsPage";
import AttendedEventsPage from "./pages/AttendedEventsPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyMatchesPage from "./pages/MyMatchesPage";
import { NotificationsProvider } from "./context/NotificationsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><OliviaChat /></AppLayout>} />
            <Route path="/besties" element={<AppLayout><BestiesPage /></AppLayout>} />
            <Route path="/social" element={<AppLayout><SocialPage /></AppLayout>} />
            <Route path="/event/:eventId" element={<AppLayout><EventDetailsPage /></AppLayout>} />
            <Route path="/create-event" element={<AppLayout><CreateEventPage /></AppLayout>} />
            <Route path="/saved-events" element={<AppLayout><SavedEventsPage /></AppLayout>} />
            <Route path="/attended-events" element={<AppLayout><AttendedEventsPage /></AppLayout>} />
            <Route path="/my-groups" element={<AppLayout><MyGroupsPage /></AppLayout>} />
            <Route path="/city" element={<AppLayout><CityPage /></AppLayout>} />
            <Route path="/my-city-match" element={<AppLayout><MyCityMatchPage /></AppLayout>} />
            <Route path="/my-city-packer" element={<AppLayout><MyCityPackerPage /></AppLayout>} />
            <Route path="/my-city-explorer" element={<AppLayout><MyCityExplorerPage /></AppLayout>} />
            <Route path="/matches" element={<AppLayout><MatchesPage /></AppLayout>} />
            <Route path="/chat/:profileId" element={<AppLayout><ChatPage /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
