
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
