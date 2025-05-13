
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import ChatInput from "@/components/olivia/ChatInput";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    sendMessage
  } = useChat({ 
    profileId: profileId || '' 
  });

  // Fetch profile details
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;
      
      try {
        // Fetch the actual profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', profileId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfile({
            id: data.id,
            name: data.full_name || 'Chat Partner',
            image: data.avatar_url
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load contact information.",
          variant: "destructive",
        });
      }
    };
    
    fetchProfile();
  }, [profileId, toast]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    console.log("ChatPage handleSendMessage called with:", content);
    try {
      const success = await sendMessage(content);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
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
    return (
      <div className="flex flex-col h-[100vh] bg-[#FDF5EF]">
        <LoadingSpinner message="Loading chat..." />
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF]">
      {/* Header with profile info */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/matches")} 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10 mr-3">
            {profile.image ? (
              <AvatarImage src={profile.image} alt={profile.name} />
            ) : (
              <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          
          <div>
            <h1 className="font-semibold text-base">{profile.name}</h1>
            <p className="text-xs text-gray-500">Online now</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Menu options can go here */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Message input area - positioned below header */}
      <div className="p-4 bg-white border-b shadow-sm sticky top-[60px] z-10">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
      
      {/* Chat background with messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDF5EF] bg-opacity-80"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23B892FF' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.sender_id === user.id 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white rounded-bl-none shadow-sm'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <div 
                  className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                    message.sender_id === user.id ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.sent_at)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatPage;
