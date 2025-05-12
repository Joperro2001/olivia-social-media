
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Paperclip, MoreVertical, Image, Mic } from "lucide-react";
import { matchedProfiles } from "@/data/matchesMockData";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Find the profile that matches the ID from the URL
    const foundProfile = matchedProfiles.find(p => p.id === profileId);
    if (foundProfile) {
      setProfile(foundProfile);

      // Initialize chat with existing messages or welcome message
      const initialMessages: Message[] = [];
      if (foundProfile.messages && foundProfile.messages.length > 0) {
        foundProfile.messages.forEach((msg: string, index: number) => {
          // Alternate between user and match for demo purposes
          initialMessages.push({
            text: msg,
            isUser: index % 2 === 0, // Even indices will be user messages
            timestamp: "Earlier"
          });
        });
      } else if (foundProfile.hasInitialMessage) {
        initialMessages.push({
          text: `You and ${foundProfile.name} matched. Let's start messaging!`,
          isUser: false,
          timestamp: "Just now"
        });
      }
      setMessages(initialMessages);
    } else {
      // Profile not found, redirect back to matches page
      navigate("/matches");
    }
  }, [profileId, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Add user message
    const newMessage: Message = {
      text: currentMessage,
      isUser: true,
      timestamp: "Just now"
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setCurrentMessage("");

    // Show toast notification
    toast({
      title: "Message Sent",
      description: `Your message was sent to ${profile?.name}`,
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none"
    });
  };

  if (!profile) {
    return <div className="flex items-center justify-center h-screen bg-[#FDF5EF]">Loading chat...</div>;
  }

  const formatTime = (timestamp: string) => {
    if (timestamp === "Just now" || timestamp === "Earlier") return timestamp;
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Chat background with messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDF5EF] bg-opacity-80"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23B892FF' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"
        }}
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] p-3 rounded-lg animate-bubble-in ${
                message.isUser 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-white rounded-bl-none shadow-sm'
              }`}
            >
              <p className="break-words">{message.text}</p>
              <p 
                className={`text-xs mt-1 text-right ${
                  message.isUser ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input area */}
      <div className="p-3 bg-white border-t">
        <div className="flex items-center gap-2 bg-[#F8F8F8] rounded-full py-1 px-3">
          <Button variant="ghost" size="icon" className="rounded-full text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Textarea 
            placeholder={`Message ${profile.name}...`} 
            value={currentMessage} 
            onChange={e => setCurrentMessage(e.target.value)} 
            className="resize-none border-0 focus-visible:ring-0 bg-transparent flex-1 py-2 min-h-0 h-10"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }} 
          />
          
          <Button 
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-500"
            disabled={currentMessage.trim().length === 0}
          >
            <Image className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`rounded-full ${currentMessage.trim().length ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}
            onClick={handleSendMessage}
            disabled={currentMessage.trim().length === 0}
          >
            {currentMessage.trim().length ? (
              <Send className="h-4 w-4" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
