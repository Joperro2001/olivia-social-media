
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
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
        foundProfile.messages.forEach((msg: string) => {
          initialMessages.push({
            text: msg,
            isUser: true,
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none",
    });
  };

  if (!profile) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/matches")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-8 w-8 mr-2">
          <img src={profile.image} alt={profile.name} />
        </Avatar>
        
        <div>
          <h1 className="font-medium text-base">{profile.name}</h1>
          <p className="text-xs text-gray-500">{profile.location}</p>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-gray-100 rounded-bl-none'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder={`Message ${profile.name}...`}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="bg-primary" 
            onClick={handleSendMessage}
            disabled={!currentMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
