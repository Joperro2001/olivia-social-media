
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
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');
    
    console.log('Current user ID:', user.id);
    
    // Try a simpler approach - directly check if a chat exists between these two users
    // This avoids the recursion in RLS policies
    const { data: existingChats, error: chatQueryError } = await supabase
      .from('chats')
      .select('id')
      .eq('type', 'direct');
    
    if (chatQueryError) {
      console.error('Error querying chats:', chatQueryError);
      throw chatQueryError;
    }
    
    console.log(`Found ${existingChats?.length || 0} direct chats`);
    
    // For each chat, check if both users are participants
    if (existingChats && existingChats.length > 0) {
      for (const chat of existingChats) {
        // We'll count participants that match our two user IDs
        const { data: participants, error: participantsError } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.id);
        
        if (participantsError) {
          console.error('Error checking chat participants:', participantsError);
          continue; // Try next chat
        }
        
        // Check if both users are in this chat's participants
        if (participants) {
          const userIds = participants.map(p => p.user_id);
          if (userIds.includes(user.id) && userIds.includes(profileId) && userIds.length === 2) {
            console.log('Found existing chat:', chat.id);
            return chat.id;
          }
        }
      }
    }
    
    console.log('No existing chat found, creating new chat');
    
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
    
    console.log('Created new chat with ID:', newChat.id);
    
    // Add both users as participants - do this in separate calls to avoid potential RLS issues
    const { error: addUser1Error } = await supabase
      .from('chat_participants')
      .insert([{ chat_id: newChat.id, user_id: user.id }]);
    
    if (addUser1Error) {
      console.error('Error adding first user as participant:', addUser1Error);
      throw addUser1Error;
    }
    
    const { error: addUser2Error } = await supabase
      .from('chat_participants')
      .insert([{ chat_id: newChat.id, user_id: profileId }]);
    
    if (addUser2Error) {
      console.error('Error adding second user as participant:', addUser2Error);
      throw addUser2Error;
    }
    
    console.log('Successfully added participants to chat:', newChat.id);
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
    // Set up the channel with proper formatting for Supabase realtime
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
          console.log('Received new message via realtime:', payload);
          const newMessage = payload.new as Message;
          onNewMessage(newMessage);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to chat:', chatId);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to chat:', chatId);
        }
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
