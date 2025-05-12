
import { useReducer } from 'react';
import { Message, ChatState } from '@/types/Chat';

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CHAT_ID'; payload: string | null }
  | { type: 'SET_LOCAL_MESSAGES'; payload: Message[] }
  | { type: 'ADD_LOCAL_MESSAGE'; payload: Message }
  | { type: 'CLEAR_LOCAL_MESSAGES' }
  | { type: 'SET_USING_LOCAL_MODE'; payload: boolean };

const initialState: ChatState = {
  messages: [],
  localMessages: [],
  isLoading: true,
  usingLocalMode: false,
  chatId: null,
  hasLocalMessages: false
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
    
    case 'SET_LOCAL_MESSAGES':
      return { 
        ...state, 
        localMessages: action.payload,
        hasLocalMessages: action.payload.length > 0
      };
    
    case 'ADD_LOCAL_MESSAGE':
      return {
        ...state,
        localMessages: [...state.localMessages, action.payload],
        hasLocalMessages: true
      };
    
    case 'CLEAR_LOCAL_MESSAGES':
      return {
        ...state,
        localMessages: [],
        hasLocalMessages: false
      };
    
    case 'SET_USING_LOCAL_MODE':
      return { ...state, usingLocalMode: action.payload };
    
    default:
      return state;
  }
};

export const useChatReducer = (initialChatState = initialState) => {
  return useReducer(chatReducer, initialChatState);
};
