
import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/olivia/ChatBubble";
import ChatInput from "@/components/olivia/ChatInput";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import SuggestionCarousel from "@/components/olivia/SuggestionCarousel";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const OliviaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    content: "Hi there! I'm Olivia, your relocation concierge. I can help you find housing, connect with like-minded people, or join local groups based on your interests. What brings you here today?",
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
      title: "Join Group Matches",
      description: "Connect with people who share your interests and goals.",
      image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=500",
      ctaText: "Explore Groups"
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
      return "Hey there! 👋 How can I help with your relocation journey today? I can help you find housing, connect with like-minded people, or join groups with shared interests!";
    }
    if (lowerCaseMessage.includes("city") || lowerCaseMessage.includes("move")) {
      return "Thinking about moving? That's exciting! Would you like to take our City Match Quiz to find your perfect location? Or I can tell you about popular expat destinations! 🌍";
    }
    if (lowerCaseMessage.includes("housing") || lowerCaseMessage.includes("apartment")) {
      return "Finding housing can be tricky! I can help you compare neighborhoods, estimate costs, or connect with trusted rental agencies. I could also introduce you to others looking for housing in the same area! What specifically do you need help with? 🏠";
    }
    if (lowerCaseMessage.includes("visa") || lowerCaseMessage.includes("passport")) {
      return "Visa requirements vary by country. I can help you understand what documents you need and guide you through the application process! Which country are you moving to? 📝";
    }
    if (lowerCaseMessage.includes("group") || lowerCaseMessage.includes("connect") || lowerCaseMessage.includes("meet") || lowerCaseMessage.includes("people")) {
      return "I'd be happy to help you connect with like-minded people! I can match you with groups based on your interests like 'tech professionals in Berlin' or 'expats looking for housing in Rotterdam'. What kind of people are you hoping to connect with? 👥";
    }
    if (lowerCaseMessage.includes("match") || lowerCaseMessage.includes("introduction")) {
      return "My group matching works through a double opt-in system, so everyone's comfortable with the introduction. Once there's a match, I can set up a group chat where you can all connect! Would you like to tell me what interests or goals you have for finding a group? 🤝";
    }
    return "Thanks for your message! I'd be happy to help with your relocation needs. I can help you find housing, connect with like-minded people, or join groups with shared interests. Could you provide a bit more detail about what you're looking for? 😊";
  };
  
  const handleCardAction = (id: string) => {
    console.log(`Card ${id} action triggered`);
    // Would handle specific card actions in a real app
    if (id === "card1") {
      handleSendMessage("I'd like to take the City Match Quiz");
    } else if (id === "card3") {
      handleSendMessage("I'm interested in joining group matches");
    }
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
    </div>
  );
};

export default OliviaChat;
