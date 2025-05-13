
import { Message } from "@/types/Chat";
import { supabase } from "@/integrations/supabase/client";

// Fetch messages for a specific chat
export const fetchChatMessages = async (chatId: string): Promise<Message[]> => {
  console.log('Fetching messages for chat:', chatId);
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('sent_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    
    console.log('Fetched messages:', data?.length);
    return data || [];
  } catch (error) {
    console.error('Error in fetchChatMessages:', error);
    throw error;
  }
};

// Get or create a chat with another user - using our get_or_create_private_chat RPC function
export const getOrCreateChat = async (profileId: string): Promise<string> => {
  console.log('Getting or creating chat with profile:', profileId);
  
  try {
    // Use the RPC function to get or create a chat
    const { data, error } = await supabase.rpc(
      'get_or_create_private_chat',
      { other_user_id: profileId }
    );
    
    if (error) {
      console.error('Error in get_or_create_private_chat RPC:', error);
      throw error;
    }
    
    console.log('Chat ID from RPC function:', data);
    if (!data) {
      throw new Error('Failed to get or create chat');
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get or create chat:', error);
    throw error;
  }
};

// Send message to database
export const sendMessageToDatabase = async (
  chatId: string,
  userId: string,
  content: string
): Promise<Message> => {
  console.log('Sending message to chat:', chatId);
  
  try {
    // Now send the message
    const newMessage = {
      chat_id: chatId,
      sender_id: userId,
      content: content.trim()
      // Note: sent_at will be automatically set by the database default
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
    
    console.log('Message sent successfully:', data);
    return data as Message;
  } catch (error) {
    console.error('Error in sendMessageToDatabase:', error);
    throw error;
  }
};

// Subscribe to real-time chat updates
export const subscribeToChat = (
  chatId: string,
  onNewMessage: (message: Message) => void
) => {
  console.log('Setting up real-time subscription for chat:', chatId);
  
  try {
    // Set up the channel for Supabase realtime
    const channel = supabase.channel(`public:messages:chat_id=eq.${chatId}`);
    
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
          console.log('Received new message via realtime:', payload);
          const newMessage = payload.new as Message;
          onNewMessage(newMessage);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
      
    return channel;
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    throw error;
  }
};

// Test database connectivity
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test connection
    console.log('Testing database connection');
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};
