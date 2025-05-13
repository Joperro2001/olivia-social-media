
export interface Message {
  id: string;
  chat_id?: string;
  sender_id: string;
  content: string;
  sent_at: string;
  read_at: string | null;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  chatId: string | null;
}

export interface UserConversationMessage {
  message_id: string;
  user_id: string;
  session_id: string;
  message_type: 'human' | 'ai';
  content: string;
  timestamp: string;
  summary_flag?: boolean;
}
