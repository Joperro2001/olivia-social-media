
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { sendChatMessage, testApiConnection } from "@/utils/apiService";
import { saveChecklistToLocalStorage } from "@/utils/checklistUtils";
import { toast } from "@/hooks/use-toast";
import { getFallbackResponse, createFallbackMessage } from "@/utils/fallbackMessages";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export function useOliviaChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    content: "Hi there! I'm Olivia, your relocation concierge. I can help you find housing, connect with like-minded people, or join local groups based on your interests. What brings you here today?",
    isUser: false,
    timestamp: "Just now"
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const autoMessageSent = useRef<boolean>(false);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    try {
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
      
      setTimeout(() => {
        setIsTyping(false);
        
        // If we got a response from the API, add it to the messages
        if (aiResponse) {
          const oliviaMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            isUser: false,
            timestamp: "Just now"
          };
          
          setMessages(prev => [...prev, oliviaMessage]);
          
          // Process side effects of AI response if needed
          processResponseSideEffects(content, aiResponse);
        } else {
          // If no response from API, use fallback
          const fallbackResponse = getFallbackResponse(content);
          const fallbackMessage = createFallbackMessage(fallbackResponse, false);
          
          setMessages(prev => [...prev, fallbackMessage]);
        }
      }, 800); // Add a small delay to simulate typing
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      
      // Use fallback response on error
      const fallbackResponse = getFallbackResponse(content);
      const fallbackMessage = createFallbackMessage(fallbackResponse, false);
      
      setMessages(prev => [...prev, fallbackMessage]);
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
    } else if (id === "card2") {
      handleSendMessage("I need information about local SIM cards").catch(error => {
        console.error("Error handling card action:", error);
      });
    }
  };

  // Function to retry connection
  const retryConnection = async () => {
    toast({
      title: "Checking connection",
      description: "Attempting to reconnect to the AI assistant..."
    });
    
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        
        // Add a system message saying connection restored
        const systemMessage: Message = {
          id: Date.now().toString(),
          content: "Connection restored! I'm back online and ready to help with your relocation needs. How can I assist you today?",
          isUser: false,
          timestamp: "Just now"
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }, 1500);
      
      return true;
    } else {
      toast({
        title: "Connection Failed",
        description: "Still unable to reach the AI assistant. Please try again later.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Check for auto-send message from session storage
  useEffect(() => {
    const autoMessage = sessionStorage.getItem("autoSendMessage");
    
    if (autoMessage && !autoMessageSent.current) {
      // Small timeout to ensure the chat is loaded before sending
      const timer = setTimeout(() => {
        handleSendMessage(autoMessage).catch(console.error);
        sessionStorage.removeItem("autoSendMessage");
        autoMessageSent.current = true;
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    messages,
    isTyping,
    handleSendMessage,
    handleCardAction,
    retryConnection
  };
}
