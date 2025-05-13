import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import SuggestionCarousel from "@/components/olivia/SuggestionCarousel";
import { useAuth } from "@/context/AuthContext";
import { saveChecklistToLocalStorage } from "@/utils/checklistUtils";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_AVATAR } from "@/constants/chatConstants";
import { sendChatMessage } from "@/utils/apiService";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const OliviaChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    content: "Hi there! I'm Olivia, your relocation concierge. I can help you find housing, connect with like-minded people, or join local groups based on your interests. What brings you here today?",
    isUser: false,
    timestamp: "Just now"
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoMessageSent = useRef<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");

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

  // Generate a session ID for this conversation
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
    }
  }, [sessionId]);

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
      if (!user && !sessionId) {
        console.error("Missing user or session ID");
        return false;
      }
      
      // Add user message to UI immediately for responsiveness
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: "Just now"
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      
      // Send message to backend API
      const userId = user?.id || "anonymous";
      const aiResponse = await sendChatMessage(userId, sessionId, content);
      
      setIsTyping(false);
      
      if (aiResponse) {
        // Add AI response to UI
        const oliviaMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isUser: false,
          timestamp: "Just now"
        };
        
        setMessages(prev => [...prev, oliviaMessage]);
        
        // Process side effects of AI response if needed
        processResponseSideEffects(content, aiResponse);
      }
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      return false;
    }
  };

  const processResponseSideEffects = (userMessage: string, aiResponse: string) => {
    // Handle city recommendations
    if (userMessage.toLowerCase().includes("you belong in")) {
      const cityMatch = userMessage.match(/you belong in ([a-z]+)/i);
      if (cityMatch && cityMatch[1]) {
        localStorage.setItem("matchedCity", cityMatch[1]);
      }
    }
    
    // Extract destination from relocation checklist flow
    if (aiResponse.includes("Which city are you moving to")) {
      // We're now in the checklist flow
      console.log("Starting checklist flow");
    } else if (messages.some(m => m.content.includes("Which city are you moving to"))) {
      // Save the destination in temporary checklist
      const checklistData = {
        title: "Moving to " + userMessage.trim(),
        destination: userMessage.trim(),
      };
      saveChecklistToLocalStorage(checklistData);
    } else if (messages.some(m => m.content.includes("what's the purpose of your move"))) {
      const checklistData = JSON.parse(localStorage.getItem("cityPackerData") || "{}");
      checklistData.purpose = userMessage.trim();
      saveChecklistToLocalStorage(checklistData);
    } else if (messages.some(m => m.content.includes("How long are you planning to stay"))) {
      // Handle duration response and create full checklist
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
      
      // Add specific items based on purpose and duration
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
    }
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

  // Auto-scroll to bottom when messages update
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
      
      <div className="flex-1 overflow-y-auto pb-2 px-4 pt-2">
        {messages.map((message, index) => <ChatBubble 
          key={message.id} 
          message={message.content} 
          isUser={message.isUser} 
          timestamp={message.timestamp} 
          avatar={!message.isUser ? DEFAULT_AVATAR : undefined} 
          isFirstMessage={index === 0}
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
