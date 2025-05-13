
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

// Get or create a chat with another user
export const getOrCreateChat = async (profileId: string): Promise<string> => {
  console.log('Getting or creating chat with profile:', profileId);
  
  try {
    // Instead of using the RPC function that's causing the recursion issue,
    // let's implement the logic directly
    
    // First check if a chat already exists
    const { data: existingChats, error: searchError } = await supabase
      .from('chats')
      .select('id, chat_participants!inner(*)')
      .eq('type', 'direct')
      .eq('chat_participants.user_id', profileId);
    
    if (searchError) {
      console.error('Error searching for existing chat:', searchError);
      throw searchError;
    }
    
    // If a chat exists with this user, return it
    if (existingChats && existingChats.length > 0) {
      console.log('Found existing chat:', existingChats[0].id);
      return existingChats[0].id;
    }
    
    // Create a new chat
    const { data: newChat, error: createError } = await supabase
      .from('chats')
      .insert([{ type: 'direct' }])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating new chat:', createError);
      throw createError;
    }
    
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');
    
    // Add both users as participants
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { chat_id: newChat.id, user_id: user.id },
        { chat_id: newChat.id, user_id: profileId }
      ]);
    
    if (participantsError) {
      console.error('Error adding chat participants:', participantsError);
      throw participantsError;
    }
    
    console.log('Created new chat:', newChat.id);
    return newChat.id;
    
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
    // Modify this to bypass the problematic RLS policy
    // Instead of just inserting the message which triggers the RLS validation
    // Let's check if the user is a participant of the chat first
    
    // First verify the user is a participant in this chat
    const { data: participant, error: participantError } = await supabase
      .from('chat_participants')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();
    
    if (participantError) {
      console.error('Error verifying chat participant:', participantError);
      throw new Error('You are not a participant in this chat');
    }
    
    // Now send the message
    const newMessage = {
      chat_id: chatId,
      sender_id: userId,
      content: content.trim()
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
    // Fix the realtime subscription
    // We need to properly format the channel name
    const channel = supabase.channel(`messages:chat_id=eq.${chatId}`);
    
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
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    throw error;
  }
};

// Test database connectivity
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test connection
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};
