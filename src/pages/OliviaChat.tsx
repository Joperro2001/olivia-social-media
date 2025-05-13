import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/olivia/ChatBubble";
import ChatInput from "@/components/olivia/ChatInput";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import SuggestionCarousel from "@/components/olivia/SuggestionCarousel";
import { useAuth } from "@/context/AuthContext";
import { saveChecklistToLocalStorage } from "@/utils/checklistUtils";

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
  const autoMessageSent = useRef<boolean>(false);
  
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

  useEffect(() => {
    // Check if there's a message to auto-send
    const autoMessage = sessionStorage.getItem("autoSendMessage");
    
    if (autoMessage && !autoMessageSent.current) {
      // Small timeout to ensure the chat is loaded before sending
      const timer = setTimeout(() => {
        handleSendMessage(autoMessage);
        sessionStorage.removeItem("autoSendMessage");
        autoMessageSent.current = true;
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, userMessage]);

      setIsTyping(true);
      
      // Return a Promise that resolves after the typing delay
      return new Promise(resolve => {
        setTimeout(() => {
          setIsTyping(false);
          const oliviaResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: getOliviaResponse(content),
            isUser: false,
            timestamp: "Just now"
          };
          setMessages(prev => [...prev, oliviaResponse]);
          resolve(true); // Resolve with true to indicate success
        }, 1500);
      });
    } catch (error) {
      console.error("Error sending message:", error);
      return Promise.resolve(false); // Return false on error
    }
  };

  const getOliviaResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // When we detect a city recommendation, save it to localStorage
    if (lowerCaseMessage.includes("you belong in")) {
      const cityMatch = lowerCaseMessage.match(/you belong in ([a-z]+)/i);
      if (cityMatch && cityMatch[1]) {
        localStorage.setItem("matchedCity", cityMatch[1]);
      }
    }
    
    // Handle checklist creation flow
    if (lowerCaseMessage.includes("create my") && 
        (lowerCaseMessage.includes("relocation") || 
         lowerCaseMessage.includes("document checklist") || 
         lowerCaseMessage.includes("moving checklist"))) {
      return "I'd be happy to help you create a relocation document checklist! Which city are you moving to?";
    }
    
    // Extract destination from user's message
    if (messages.some(m => m.content.includes("Which city are you moving to"))) {
      // Save the destination in temporary checklist
      const checklistData = {
        title: "Moving to " + userMessage.trim(),
        destination: userMessage.trim(),
      };
      saveChecklistToLocalStorage(checklistData);
      return "Great! And what's the purpose of your move? (e.g., work, study, lifestyle change)";
    }
    
    // Extract purpose from user's message
    if (messages.some(m => m.content.includes("what's the purpose of your move"))) {
      const checklistData = JSON.parse(localStorage.getItem("cityPackerData") || "{}");
      checklistData.purpose = userMessage.trim();
      saveChecklistToLocalStorage(checklistData);
      return "Excellent! How long are you planning to stay there? (e.g., 3 months, 1 year, permanent)";
    }
    
    // Extract duration from user's message and finalize checklist
    if (messages.some(m => m.content.includes("How long are you planning to stay"))) {
      const checklistData = JSON.parse(localStorage.getItem("cityPackerData") || "{}");
      checklistData.duration = userMessage.trim();
      
      // Add relocation document checklist items based on destination and duration
      const longStay = userMessage.toLowerCase().includes("permanent") || 
                      userMessage.toLowerCase().includes("year") ||
                      userMessage.includes("long");
      
      const isStudent = checklistData.purpose?.toLowerCase().includes("study");
      const isWork = checklistData.purpose?.toLowerCase().includes("work");
      
      const items = [
        { category: "Visa & Immigration", text: "Valid passport (min. 6 months validity)", checked: false },
        { category: "Visa & Immigration", text: "Visa application forms", checked: false },
        { category: "Visa & Immigration", text: "Passport photos", checked: false },
        { category: "Health & Insurance", text: "International health insurance", checked: false },
        { category: "Health & Insurance", text: "Vaccination records", checked: false },
        { category: "Housing", text: "Temporary accommodation booking", checked: false },
        { category: "Housing", text: "Rental deposit funds", checked: false },
        { category: "Communication", text: "International SIM card or eSIM", checked: false },
        { category: "Travel", text: "Flight tickets", checked: false },
        { category: "Finance", text: "Bank statements (last 3 months)", checked: false },
        { category: "Finance", text: "Foreign currency or travel card", checked: false },
      ];
      
      if (isStudent) {
        items.push(
          { category: "Education", text: "University acceptance letter", checked: false },
          { category: "Education", text: "Scholarship documentation (if applicable)", checked: false },
          { category: "Education", text: "Academic transcripts", checked: false },
          { category: "Education", text: "Student visa paperwork", checked: false }
        );
      }
      
      if (isWork) {
        items.push(
          { category: "Employment", text: "Work contract", checked: false },
          { category: "Employment", text: "Work visa/permit", checked: false },
          { category: "Employment", text: "Professional certificates", checked: false },
          { category: "Employment", text: "Reference letters", checked: false }
        );
      }
      
      if (longStay) {
        items.push(
          { category: "Visa & Immigration", text: "Birth certificate", checked: false },
          { category: "Visa & Immigration", text: "Marriage certificate (if applicable)", checked: false },
          { category: "Housing", text: "Proof of income for rental applications", checked: false },
          { category: "Finance", text: "Tax documents from home country", checked: false },
          { category: "Health & Insurance", text: "Medical history records", checked: false },
          { category: "Personal", text: "Driver's license or International Driving Permit", checked: false }
        );
      }
      
      checklistData.items = items;
      saveChecklistToLocalStorage(checklistData);
      
      return `Perfect! I've created a customized relocation document checklist for your ${checklistData.duration} stay in ${checklistData.destination} for ${checklistData.purpose}. This includes essential documents for visa applications, housing, healthcare, and more. You can view and manage your checklist in the My City Packer section. Would you like to view your checklist now?`;
    }
    
    // User wants to view checklist
    if (lowerCaseMessage.includes("yes") && messages.some(m => m.content.includes("Would you like to view your checklist now"))) {
      return "Great! You can find your moving checklist in the My City Packer section. I've just added it there for you. Is there anything else you'd like to know about your move?";
    }
    
    if (lowerCaseMessage.includes("find my city match") || lowerCaseMessage.includes("city match")) {
      return "I'd be happy to help you find your perfect city match! Let's start by understanding your preferences. What climate do you prefer? Warm and sunny, moderate, or cooler temperatures?";
    }
    
    if (lowerCaseMessage.includes("warm") || lowerCaseMessage.includes("sunny")) {
      return "Great! Warm and sunny climates. Do you prefer coastal cities with beaches, or are you more interested in urban environments with lots of cultural activities?";
    }
    
    if (lowerCaseMessage.includes("beaches") || lowerCaseMessage.includes("coastal")) {
      return "Excellent! Based on your preferences for warm weather and coastal living, you belong in Barcelona! It offers beautiful beaches, amazing culture, and a relaxed Mediterranean lifestyle.";
    }
    
    if (lowerCaseMessage.includes("urban") || lowerCaseMessage.includes("cultural")) {
      localStorage.setItem("matchedCity", "Berlin");
      return "Based on your preferences for cultural activities and urban environments, you belong in Berlin! It's a vibrant city with amazing arts, music, and a diverse cultural scene.";
    }
    
    if (lowerCaseMessage.includes("moderate") || lowerCaseMessage.includes("mild")) {
      localStorage.setItem("matchedCity", "London");
      return "Based on your preference for moderate weather, you belong in London! It offers a temperate climate, rich history, and endless cultural opportunities.";
    }
    
    if (lowerCaseMessage.includes("cool") || lowerCaseMessage.includes("cold")) {
      return "Do you prefer a bustling city environment or somewhere with access to nature and outdoor activities?";
    }
    
    if (lowerCaseMessage.includes("bustling") || lowerCaseMessage.includes("city environment")) {
      localStorage.setItem("matchedCity", "New York");
      return "Based on your preferences for cooler weather and vibrant city life, you belong in New York! It has incredible energy, diverse neighborhoods, and endless opportunities.";
    }
    
    if (lowerCaseMessage.includes("nature") || lowerCaseMessage.includes("outdoor")) {
      localStorage.setItem("matchedCity", "Tokyo");
      return "Based on your preferences, you belong in Tokyo! While it's a massive city, it has excellent access to nature and outdoor activities nearby, plus a fascinating blend of traditional and ultramodern.";
    }
    
    if (lowerCaseMessage.includes("checklist") || lowerCaseMessage.includes("packer")) {
      return "I'll help you create a personalized moving checklist. Which city are you planning to move to?";
    }
    
    if (lowerCaseMessage.includes("explore") || lowerCaseMessage.includes("settle in")) {
      return "Welcome to your new city! To help you settle in and explore, I'll need to know which city you're in. Could you let me know where you've moved to?";
    }
    
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
    if (id === "card1") {
      handleSendMessage("I'd like to take the City Match Quiz").catch(error => {
        console.error("Error handling card action:", error);
      });
    } else if (id === "card3") {
      handleSendMessage("I'm interested in joining group matches").catch(error => {
        console.error("Error handling card action:", error);
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Ask Olivia</h1>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-2 px-4">
        {messages.map(message => <ChatBubble 
          key={message.id} 
          message={message.content} 
          isUser={message.isUser} 
          timestamp={message.timestamp} 
          avatar={!message.isUser ? "/lovable-uploads/eec42500-64ac-429a-b4d6-e87431861420.png" : undefined} 
        />)}
        
        {isTyping && <TypingIndicator />}
        
        {messages.length <= 2 && !isTyping && <SuggestionCarousel suggestions={suggestedCards} onCardAction={handleCardAction} />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-0 pb-8 sticky bottom-0 py-0 bg-gradient-to-t from-[#FDF5EF] to-transparent pt-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default OliviaChat;
