

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import OliviaChat from "./pages/OliviaChat";
import BestiesPage from "./pages/BestiesPage";
import SocialPage from "./pages/SocialPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import SettingsPage from "./pages/SettingsPage";
import MyGroupsPage from "./pages/MyGroupsPage";
import CityPage from "./pages/CityPage";
import MyCityMatchPage from "./pages/MyCityMatchPage";
import MyCityPackerPage from "./pages/MyCityPackerPage";
import MyCityExplorerPage from "./pages/MyCityExplorerPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import AIChatPage from "./pages/AIChatPage";
import NotFound from "./pages/NotFound";
import EventDetailsPage from "./pages/EventDetailsPage";
import SavedEventsPage from "./pages/SavedEventsPage";
import AttendedEventsPage from "./pages/AttendedEventsPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyMatchesPage from "./pages/MyMatchesPage";
import { NotificationsProvider } from "./context/NotificationsContext";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <NotificationsProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout><OliviaChat /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/besties" element={
                <ProtectedRoute>
                  <AppLayout><BestiesPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/social" element={
                <ProtectedRoute>
                  <AppLayout><SocialPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/event/:eventId" element={
                <ProtectedRoute>
                  <AppLayout><EventDetailsPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/create-event" element={
                <ProtectedRoute>
                  <AppLayout><CreateEventPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/saved-events" element={
                <ProtectedRoute>
                  <AppLayout><SavedEventsPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/attended-events" element={
                <ProtectedRoute>
                  <AppLayout><AttendedEventsPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-groups" element={
                <ProtectedRoute>
                  <AppLayout><MyGroupsPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/city" element={
                <ProtectedRoute>
                  <AppLayout><CityPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-city-match" element={
                <ProtectedRoute>
                  <AppLayout><MyCityMatchPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-city-packer" element={
                <ProtectedRoute>
                  <AppLayout><MyCityPackerPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-city-explorer" element={
                <ProtectedRoute>
                  <AppLayout><MyCityExplorerPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/matches" element={
                <ProtectedRoute>
                  <AppLayout><MatchesPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/chat/:profileId" element={
                <ProtectedRoute>
                  <AppLayout><ChatPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/ai-chat" element={
                <ProtectedRoute>
                  <AppLayout><AIChatPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/ai-chat/:conversationId" element={
                <ProtectedRoute>
                  <AppLayout><AIChatPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AppLayout><ProfilePage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/edit-profile" element={
                <ProtectedRoute>
                  <AppLayout><EditProfilePage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AppLayout><SettingsPage /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationsProvider>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
