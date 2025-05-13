import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatLoadingSkeleton from "@/components/chat/ChatLoadingSkeleton";
import ChatError from "@/components/chat/ChatError";

interface Profile {
  id: string;
  name: string;
  image?: string;
  full_name?: string;
  avatar_url?: string;
}

const ChatPage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  
  const { 
    messages, 
    isLoading, 
    connectionError,
    sendMessage,
    retry
  } = useChat({ 
    profileId: profileId || '' 
  });

  // Fetch profile details
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        toast({
          title: "Error",
          description: "No profile ID provided.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Fetch the actual profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', profileId)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }
        
        if (data) {
          setProfile({
            id: data.id,
            name: data.full_name || 'Chat Partner',
            image: data.avatar_url
          });
        } else {
          toast({
            title: "Profile not found",
            description: "Couldn't find this user's profile.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load contact information.",
          variant: "destructive",
        });
      }
    };
    
    if (user && profileId) {
      fetchProfile();
    }
  }, [profileId, toast, user]);
  
  const handleSendMessage = async (content: string) => {
    console.log("ChatPage handleSendMessage called with:", content);
    try {
      const success = await sendMessage(content);
      return success;
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending your message.",
        variant: "destructive",
      });
      return false;
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="flex flex-col h-[100vh] bg-[#FDF5EF]">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Please log in to view this chat</p>
        </div>
      </div>
    );
  }

  if (isLoading || !profile) {
    return <ChatLoadingSkeleton onBack={() => navigate("/matches")} />;
  }

  if (connectionError) {
    return <ChatError onRetry={retry} />;
  }

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF]">
      {/* Header with profile info */}
      <ChatHeader profile={profile} onRefresh={retry} />
      
      {/* Message input area - at top */}
      <div className="p-4 bg-white border-b shadow-sm">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
      
      {/* Chat background with messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDF5EF] bg-opacity-80"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23B892FF' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"
        }}
      >
        <ChatMessageList 
          messages={messages}
          userId={user.id}
          formatTime={formatTime}
        />
      </div>
    </div>
  );
};

export default ChatPage;
