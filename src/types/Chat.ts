
export type Message = {
  id: string;
  content: string;
  sender_id: string;
  sent_at: string;
  read_at: string | null;
};

export type AIMessage = {
  id: string;
  conversation_id: string;
  content: string;
  sender: string;
  created_at: string;
};

export type ChatState = {
  messages: Message[];
  localMessages: Message[];
  isLoading: boolean;
  usingLocalMode: boolean;
  chatId: string | null;
  hasLocalMessages: boolean;
};

export type AIAgent = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type AIConversation = {
  id: string;
  title: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
};

// Simplified types for the updated schema
export type UserConversationMessage = {
  message_id: string;
  user_id: string;
  session_id: string;
  timestamp: string;
  message_type: 'human' | 'ai';
  content: string;
  summary_flag: boolean;
};

export type UserChecklist = {
  user_id: string;
  checklist_data: {
    items: ChecklistItemData[];
  };
};

export type ChecklistItemData = {
  id: string;
  description: string;
  is_checked: boolean;
  auto_checked?: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
};
