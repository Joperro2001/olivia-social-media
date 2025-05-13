
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

// New types for the updated schema
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
  checklist_id: string;
  user_id: string;
  title: string;
  description: string | null;
  checklist_data: {
    items: ChecklistItemData[];
    original_id?: string;
    original_conversation_id?: string;
    created_at?: string;
  };
  created_at: string;
  updated_at: string;
};

export type ChecklistItemData = {
  id: string;
  description: string;
  is_checked: boolean;
  auto_checked?: boolean;
  created_at?: string;
  updated_at?: string;
};
