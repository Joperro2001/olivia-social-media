
import { Message } from "@/types/Chat";
import { supabase } from "@/integrations/supabase/client";

// Save local messages to localStorage
export const saveLocalMessages = (
  userId: string | undefined,
  profileId: string,
  messages: Message[]
): void => {
  if (!userId || !profileId || messages.length === 0) return;
  
  try {
    const savedLocalKey = `chat_local_${userId}_${profileId}`;
    localStorage.setItem(savedLocalKey, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving local messages:', error);
  }
};

// Load local messages from localStorage
export const loadLocalMessages = (
  userId: string | undefined,
  profileId: string
): Message[] => {
  if (!userId || !profileId) return [];
  
  try {
    const savedLocalKey = `chat_local_${userId}_${profileId}`;
    const savedMessages = localStorage.getItem(savedLocalKey);
    
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (Array.isArray(parsedMessages)) {
        console.log('Loaded saved local messages:', parsedMessages.length);
        return parsedMessages;
      }
    }
  } catch (error) {
    console.error('Error loading saved local messages:', error);
  }
  
  return [];
};

// Fetch messages for a specific chat
export const fetchChatMessages = async (chatId: string): Promise<Message[]> => {
  console.log('Fetching messages for chat:', chatId);
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('sent_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  
  console.log('Fetched messages:', data);
  return data || [];
};

// Get or create a chat with another user
export const getOrCreateChat = async (profileId: string): Promise<string> => {
  console.log('Getting or creating chat with profile:', profileId);
  
  const { data, error } = await supabase
    .rpc('get_or_create_private_chat', {
      other_user_id: profileId
    });
    
  if (error) {
    console.error('Error in get_or_create_private_chat:', error);
    throw error;
  }
  
  console.log('Chat ID:', data);
  return data;
};

// Send message to database
export const sendMessageToDatabase = async (
  chatId: string,
  userId: string,
  content: string
): Promise<boolean> => {
  console.log('Sending message to chat:', chatId);
  
  const newMessage = {
    chat_id: chatId,
    sender_id: userId,
    content: content.trim()
  };
  
  const { error } = await supabase
    .from('messages')
    .insert([newMessage])
    .select();
  
  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
  
  return true;
};

// Create a new local message
export const createLocalMessage = (
  content: string,
  userId: string
): Message => {
  return {
    id: Date.now().toString(),
    content: content.trim(),
    sender_id: userId,
    sent_at: new Date().toISOString(),
    read_at: null
  };
};

// Subscribe to real-time chat updates
export const subscribeToChat = (
  chatId: string,
  onNewMessage: (message: Message) => void
) => {
  console.log('Setting up real-time subscription for chat:', chatId);
  
  const channel = supabase.channel(`chat:${chatId}`);
  
  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload) => {
        console.log('Received new message:', payload);
        const newMessage = payload.new as Message;
        onNewMessage(newMessage);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });
    
  return channel;
};
