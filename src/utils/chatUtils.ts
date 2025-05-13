
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/Chat";

// Tests if we can connect to the database
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
};

// Gets or creates a chat with another user
export const getOrCreateChat = async (otherProfileId: string): Promise<string> => {
  try {
    if (!otherProfileId) {
      throw new Error('Profile ID is required');
    }
    
    const { data, error } = await supabase
      .rpc('get_or_create_private_chat', {
        other_user_id: otherProfileId
      });
    
    if (error) {
      console.error('Error getting or creating chat:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No chat ID returned');
    }
    
    console.log('Chat ID retrieved or created:', data);
    return data;
  } catch (error) {
    console.error('Error in getOrCreateChat:', error);
    throw error;
  }
};

// Fetches messages for a specific chat
export const fetchChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('sent_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchChatMessages:', error);
    throw error;
  }
};

// Sends a new message to a chat
export const sendMessageToDatabase = async (
  chatId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  try {
    const newMessage = {
      chat_id: chatId,
      sender_id: senderId,
      content
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert([newMessage])
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No message data returned');
    }
    
    return data;
  } catch (error) {
    console.error('Error in sendMessageToDatabase:', error);
    throw error;
  }
};

// Sets up real-time subscription for a chat
export const subscribeToChat = (chatId: string, callback: (message: Message) => void) => {
  try {
    if (!chatId) {
      console.error("Cannot subscribe: missing chat ID");
      return null;
    }
    
    console.log(`Setting up subscription for chat: ${chatId}`);
    
    const channel = supabase
      .channel(`messages:chat_id=${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Received new message:', payload);
        callback(payload.new as Message);
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
    
    return channel;
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    return null;
  }
};
