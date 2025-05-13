
import { useReducer } from 'react';
import { Message, ChatState } from '@/types/Chat';

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CHAT_ID'; payload: string | null };

const initialState: ChatState = {
  messages: [],
  isLoading: true,
  chatId: null
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      // Check if message already exists
      if (state.messages.find(msg => msg.id === action.payload.id)) {
        return state;
      }
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
    
    case 'SET_CHAT_ID':
      return { ...state, chatId: action.payload };
    
    default:
      return state;
  }
};

export const useChatReducer = (initialChatState = initialState) => {
  return useReducer(chatReducer, initialChatState);
};
