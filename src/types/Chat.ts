

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sent_at: string;
  read_at: string | null;
}

export interface ChatState {
  messages: Message[];
  localMessages: Message[];
  isLoading: boolean;
  usingLocalMode: boolean;
  chatId: string | null;
  hasLocalMessages: boolean;
}

// AI Chat interfaces
export interface AIMessage {
  id: string;
  content: string;
  sender: string; // 'user' or 'ai'
  conversation_id: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  title: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIPreparationList {
  id: string;
  conversation_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIPreparationItem {
  id: string;
  list_id: string;
  description: string;
  is_checked: boolean;
  auto_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIChatState {
  messages: AIMessage[];
  conversation: AIConversation | null;
  agent: AIAgent | null;
  isLoading: boolean;
  error: string | null;
}
