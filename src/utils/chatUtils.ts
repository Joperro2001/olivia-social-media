
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
    
    // First check if a chat already exists between these users
    const { data: chatParticipants, error: fetchParticipantsError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id);
      
    if (fetchParticipantsError) {
      console.error('Error checking for existing chats:', fetchParticipantsError);
      throw fetchParticipantsError;
    }
    
    if (chatParticipants && chatParticipants.length > 0) {
      // Get the chat IDs where the current user is a participant
      const userChatIds = chatParticipants.map(p => p.chat_id);
      
      // Now check if the other user is also a participant in any of these chats
      const { data: matchingChats, error: matchError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', profileId)
        .in('chat_id', userChatIds);
        
      if (matchError) {
        console.error('Error finding matching chats:', matchError);
        throw matchError;
      }
      
      // If a matching chat is found, return that chat ID
      if (matchingChats && matchingChats.length > 0) {
        console.log('Found existing chat:', matchingChats[0].chat_id);
        return matchingChats[0].chat_id;
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
    
    // Add both users as participants
    const { error: addParticipantsError } = await supabase
      .from('chat_participants')
      .insert([
        { chat_id: newChat.id, user_id: user.id },
        { chat_id: newChat.id, user_id: profileId }
      ]);
    
    if (addParticipantsError) {
      console.error('Error adding chat participants:', addParticipantsError);
      throw addParticipantsError;
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
    // Verify the user is a participant in this chat
    const { data: participant, error: participantQueryError } = await supabase
      .from('chat_participants')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();
    
    if (participantQueryError) {
      console.error('Error verifying chat participant:', participantQueryError);
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
