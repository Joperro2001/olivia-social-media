
import { v4 as uuidv4 } from "uuid";

interface FallbackMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

// This function provides fallback responses when the API is unavailable
export const getFallbackResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Try to generate somewhat relevant responses based on keywords
  if (lowerCaseMessage.includes('hello') || 
      lowerCaseMessage.includes('hi') || 
      lowerCaseMessage.includes('hey')) {
    return "Hello! I'm Olivia, your relocation concierge. I'm operating in offline mode right now due to connection issues, but I'll do my best to assist you. How can I help with your relocation needs?";
  }
  
  if (lowerCaseMessage.includes('housing') || 
      lowerCaseMessage.includes('apartment') || 
      lowerCaseMessage.includes('rent') || 
      lowerCaseMessage.includes('live')) {
    return "I understand you're looking for housing information. While I'm operating in offline mode due to connection issues, I can tell you that finding the right accommodation is crucial for a successful relocation. Typically, I'd help you explore options based on your budget and preferences. Please try again later when our connection is restored.";
  }
  
  if (lowerCaseMessage.includes('city') || 
      lowerCaseMessage.includes('place') || 
      lowerCaseMessage.includes('area') || 
      lowerCaseMessage.includes('location')) {
    return "You seem interested in city information. While I'm in offline mode due to connection issues, I can say that choosing the right city depends on factors like job opportunities, cost of living, climate, and lifestyle preferences. When our connection is restored, I can provide more personalized recommendations.";
  }
  
  if (lowerCaseMessage.includes('job') || 
      lowerCaseMessage.includes('work') || 
      lowerCaseMessage.includes('career') || 
      lowerCaseMessage.includes('employment')) {
    return "I see you're asking about employment opportunities. While I'm in offline mode due to connection issues, finding work in a new location often requires understanding the local job market, networking, and possibly updating your resume for regional preferences. Please try again when our connection is restored.";
  }
  
  if (lowerCaseMessage.includes('cost') || 
      lowerCaseMessage.includes('expensive') || 
      lowerCaseMessage.includes('cheap') || 
      lowerCaseMessage.includes('budget') || 
      lowerCaseMessage.includes('afford')) {
    return "Cost considerations are important when relocating. While I'm currently in offline mode due to connection issues, I'd typically help analyze cost of living differences, housing costs, and budgeting for your move. Please try again later when our connection is restored.";
  }
  
  // Default fallback response
  return "I'm currently in offline mode due to connection issues. I'm designed to help with relocation questions about housing, city recommendations, job opportunities, and more. Please try again later when our connection is restored, and I'll be able to provide more personalized assistance.";
};

// Create a fallback message object for UI rendering
export const createFallbackMessage = (content: string, isUser: boolean): FallbackMessage => {
  return {
    id: uuidv4(),
    content,
    isUser,
    timestamp: "Just now"
  };
};
