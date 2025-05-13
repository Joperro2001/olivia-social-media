
import { Message } from "@/types/Chat";
import { supabase } from "@/integrations/supabase/client";
import { encryptMessage, decryptMessage, encryptMessages, decryptMessages } from "./encryptionUtils";
import { getChatStoragePrefs, shouldPurgeOldMessages, purgeOldLocalMessages } from "./storagePrefsUtils";

// Save local messages to localStorage with encryption
export const saveLocalMessages = async (
  userId: string | undefined,
  profileId: string,
  messages: Message[]
): Promise<void> => {
  if (!userId || !profileId || messages.length === 0) return;
  
  try {
    const prefs = getChatStoragePrefs(userId);
    
    // Return early if local storage is disabled
    if (!prefs.useLocalStorage) {
      console.log('Local storage is disabled by user preference');
      return;
    }
    
    const savedLocalKey = `chat_local_${userId}_${profileId}`;
    
    // Encrypt messages if enabled
    let messagesToSave = messages;
    if (prefs.encryptLocalMessages) {
      messagesToSave = await encryptMessages(messages, userId);
    }
    
    localStorage.setItem(savedLocalKey, JSON.stringify(messagesToSave));
    console.log(`Saved ${messages.length} messages to local storage (encrypted: ${prefs.encryptLocalMessages})`);
    
    // Periodically clean up old messages
    if (Math.random() < 0.1) { // 10% chance to run cleanup on each save
      purgeOldLocalMessages(userId);
    }
  } catch (error) {
    console.error('Error saving local messages:', error);
  }
};

// Load local messages from localStorage and decrypt if needed
export const loadLocalMessages = async (
  userId: string | undefined,
  profileId: string
): Promise<Message[]> => {
  if (!userId || !profileId) return [];
  
  try {
    const prefs = getChatStoragePrefs(userId);
    
    // Return empty if local storage is disabled
    if (!prefs.useLocalStorage) {
      console.log('Local storage is disabled by user preference');
      return [];
    }
    
    const savedLocalKey = `chat_local_${userId}_${profileId}`;
    const savedMessages = localStorage.getItem(savedLocalKey);
    
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (Array.isArray(parsedMessages)) {
        console.log('Loaded saved local messages:', parsedMessages.length);
        
        // Decrypt messages if they appear to be encrypted
        if (prefs.encryptLocalMessages) {
          return await decryptMessages(parsedMessages, userId);
        }
        
        return parsedMessages;
      }
    }
  } catch (error) {
    console.error('Error loading saved local messages:', error);
  }
  
  return [];
};

// Delete local messages from localStorage
export const deleteLocalMessages = (
  userId: string | undefined,
  profileId: string
): void => {
  if (!userId || !profileId) return;
  
  try {
    const savedLocalKey = `chat_local_${userId}_${profileId}`;
    localStorage.removeItem(savedLocalKey);
    console.log('Deleted local messages from storage');
  } catch (error) {
    console.error('Error deleting local messages:', error);
  }
};

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

// Create a new local message with optional encryption
export const createLocalMessage = async (
  content: string,
  userId: string
): Promise<Message> => {
  const prefs = getChatStoragePrefs(userId);
  let messageContent = content.trim();
  
  // Encrypt if enabled
  if (prefs.encryptLocalMessages) {
    messageContent = await encryptMessage(messageContent, userId);
  }
  
  return {
    id: Date.now().toString(),
    content: messageContent,
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
  
  try {
    // Channel name should follow proper format for Supabase realtime
    const channel = supabase.channel('realtime:public:messages');
    
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

// Batch send multiple messages to the database
export const sendMultipleMessagesToDatabase = async (
  chatId: string,
  messages: Message[]
): Promise<boolean> => {
  if (!messages.length) return true;
  
  console.log(`Attempting to send ${messages.length} messages to database`);
  
  try {
    // Ensure any encrypted messages are decrypted before sending to server
    const processedMessages = await Promise.all(
      messages.map(async (msg) => {
        // Try to decrypt if it looks encrypted
        const content = await decryptMessage(msg.content, msg.sender_id);
        
        return {
          chat_id: chatId,
          sender_id: msg.sender_id,
          content: content,
          sent_at: msg.sent_at
        };
      })
    );
    
    const { error } = await supabase
      .from('messages')
      .insert(processedMessages);
      
    if (error) {
      console.error('Error batch sending messages:', error);
      return false;
    }
    
    console.log(`Successfully synchronized ${messages.length} messages`);
    return true;
  } catch (error) {
    console.error('Error in batch message send:', error);
    return false;
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
