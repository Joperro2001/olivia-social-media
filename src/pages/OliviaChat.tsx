
import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/olivia/ChatBubble";
import ChatInput from "@/components/olivia/ChatInput";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import SuggestionCarousel from "@/components/olivia/SuggestionCarousel";
import FloatingVoiceButton from "@/components/olivia/FloatingVoiceButton";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const OliviaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    content: "Hi there! I'm Olivia, your relocation concierge. How can I help you today?",
    isUser: false,
    timestamp: "Just now"
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestedCards = [
    {
      id: "card1",
      title: "Find Your Perfect City",
      description: "Take our City Match Quiz and discover where you'd thrive!",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=500",
      ctaText: "Start Quiz"
    }, {
      id: "card2",
      title: "Get a Local SIM Card",
      description: "Stay connected with affordable mobile data options.",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=500",
      ctaText: "View Options"
    }, {
      id: "card3",
      title: "Housing Assistance",
      description: "Find roommates, short-term rentals, or your dream apartment.",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500",
      ctaText: "Explore Housing"
    }
  ];
  
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: "Just now"
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate Olivia typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Add Olivia's response
      const oliviaResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getOliviaResponse(content),
        isUser: false,
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, oliviaResponse]);
    }, 1500);
  };
  
  const getOliviaResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      return "Hey there! 👋 How can I help with your relocation journey today?";
    }
    if (lowerCaseMessage.includes("city") || lowerCaseMessage.includes("move")) {
      return "Thinking about moving? That's exciting! Would you like to take our City Match Quiz to find your perfect location? Or I can tell you about popular expat destinations! 🌍";
    }
    if (lowerCaseMessage.includes("housing") || lowerCaseMessage.includes("apartment")) {
      return "Finding housing can be tricky! I can help you compare neighborhoods, estimate costs, or connect with trusted rental agencies. What specifically do you need help with? 🏠";
    }
    if (lowerCaseMessage.includes("visa") || lowerCaseMessage.includes("passport")) {
      return "Visa requirements vary by country. I can help you understand what documents you need and guide you through the application process! Which country are you moving to? 📝";
    }
    return "Thanks for your message! I'd be happy to help with your relocation needs. Could you provide a bit more detail about what you're looking for? 😊";
  };
  
  const handleCardAction = (id: string) => {
    console.log(`Card ${id} action triggered`);
    // Would handle specific card actions in a real app
    if (id === "card1") {
      handleSendMessage("I'd like to take the City Match Quiz");
    }
  };

  const handleVoiceActivate = () => {
    console.log("Voice activated");
    // Would implement voice functionality in a real app
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);
  
  return (
    <div className="flex flex-col h-[100vh] bg-[#D3E4FD] pb-16">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">Ask Olivia</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-2 px-4">
        {messages.map(message => <ChatBubble key={message.id} message={message.content} isUser={message.isUser} timestamp={message.timestamp} avatar={!message.isUser ? "https://api.dicebear.com/7.x/thumbs/svg?seed=olivia" : undefined} />)}
        
        {/* Show typing indicator when Olivia is "typing" */}
        {isTyping && <TypingIndicator />}
        
        {/* Show suggestion carousel after first message */}
        {messages.length <= 2 && !isTyping && <SuggestionCarousel suggestions={suggestedCards} onCardAction={handleCardAction} />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-0 pb-0 sticky bottom-0 py-0 bg-gradient-to-t from-[#D3E4FD] to-transparent pt-6">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
      
      <FloatingVoiceButton onActivate={handleVoiceActivate} />
    </div>
  );
};

export default OliviaChat;
