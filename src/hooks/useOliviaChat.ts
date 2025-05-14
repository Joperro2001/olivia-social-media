
import { useState, useRef, useEffect } from "react";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const autoMessageSent = useRef<boolean>(false);
  const offlineModeActive = useRef<boolean>(false);
  
  // Initialize chat on component mount
  useEffect(() => {
    // Generate a persistent sessionId for this user
    const userId = user?.id || "anonymous";
    const storedSessionId = localStorage.getItem(`olivia_session_${userId}`);
    const newSessionId = storedSessionId || uuidv4();
    
    if (!storedSessionId) {
      localStorage.setItem(`olivia_session_${userId}`, newSessionId);
    }
    
    setSessionId(newSessionId);
    
    // Load saved messages from localStorage
    const savedMessages = localStorage.getItem(`olivia_messages_${userId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        // If there's an error parsing, set the default welcome message
        setMessages([{
          id: "1",
          content: "Hi there! I'm Olivia, your relocation concierge. I can help you find housing, connect with like-minded people, or join local groups based on your interests. What brings you here today?",
          isUser: false,
          timestamp: "Just now"
        }]);
      }
    } else {
      // Set default welcome message if no saved messages
      setMessages([{
        id: "1",
        content: "Hi there! I'm Olivia, your relocation concierge. I can help you find housing, connect with like-minded people, or join local groups based on your interests. What brings you here today?",
        isUser: false,
        timestamp: "Just now"
      }]);
    }
  }, [user]);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      const userId = user?.id || "anonymous";
      localStorage.setItem(`olivia_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, user]);

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
      
      // Try to send message to backend API
      const userId = user?.id || "anonymous";
      
      // If we're already in offline mode, don't even try to connect
      let aiResponse: string | null = null;
      if (!offlineModeActive.current) {
        aiResponse = await sendChatMessage(userId, sessionId, content);
        // If we get a null response, we're in offline mode
        offlineModeActive.current = aiResponse === null;
      }
      
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
  const retryConnection = async (): Promise<boolean> => {
    try {
      setIsTyping(true);
      
      // Try with a short timeout for faster feedback
      const isConnected = await testApiConnection();
      
      // Short timeout for UI feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      
      if (isConnected) {
        // Reset offline mode flag
        offlineModeActive.current = false;
        
        // Add a system message saying connection restored
        const systemMessage: Message = {
          id: Date.now().toString(),
          content: "Connection restored! I'm back online and ready to help with your relocation needs. How can I assist you today?",
          isUser: false,
          timestamp: "Just now"
        };
        
        setMessages(prev => [...prev, systemMessage]);
        return true;
      } else {
        // Update offline mode flag
        offlineModeActive.current = true;
        return false;
      }
    } catch (error) {
      console.error("Error in retry connection:", error);
      setIsTyping(false);
      return false;
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    const userId = user?.id || "anonymous";
    
    // Remove messages from localStorage
    localStorage.removeItem(`olivia_messages_${userId}`);
    
    // Reset to initial welcome message
    setMessages([{
      id: "1",
      content: "Hi there! I'm Olivia, your relocation concierge. I can help you find housing, connect with like-minded people, or join local groups based on your interests. What brings you here today?",
      isUser: false,
      timestamp: "Just now"
    }]);
    
    toast({
      title: "Chat history cleared",
      description: "Your conversation has been reset.",
    });
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
    retryConnection,
    clearChatHistory
  };
}
