
/**
 * Utilities for managing user preferences related to chat storage
 */

// Default preferences
const DEFAULT_PREFS = {
  useLocalStorage: true,
  autoDeleteAfterSync: true,
  localStorageTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

type ChatStoragePrefs = typeof DEFAULT_PREFS;

// Get user preferences for chat storage
export const getChatStoragePrefs = (userId: string | undefined): ChatStoragePrefs => {
  if (!userId) return DEFAULT_PREFS;
  
  try {
    const savedPrefs = localStorage.getItem(`chat_prefs_${userId}`);
    if (savedPrefs) {
      return { ...DEFAULT_PREFS, ...JSON.parse(savedPrefs) };
    }
  } catch (error) {
    console.error('Error loading chat preferences:', error);
  }
  
  return DEFAULT_PREFS;
};

// Save user preferences for chat storage
export const saveChatStoragePrefs = (
  userId: string | undefined,
  prefs: Partial<ChatStoragePrefs>
): void => {
  if (!userId) return;
  
  try {
    const currentPrefs = getChatStoragePrefs(userId);
    const updatedPrefs = { ...currentPrefs, ...prefs };
    localStorage.setItem(`chat_prefs_${userId}`, JSON.stringify(updatedPrefs));
    console.log('Saved chat preferences:', updatedPrefs);
  } catch (error) {
    console.error('Error saving chat preferences:', error);
  }
};

// Clean up old local messages across all chats
export const purgeOldLocalMessages = (userId: string | undefined): void => {
  if (!userId) return;
  
  try {
    // Find all local chat keys for this user
    const chatKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`chat_local_${userId}_`)) {
        chatKeys.push(key);
      }
    }
    
    // Process each chat
    chatKeys.forEach(key => {
      try {
        const messages = JSON.parse(localStorage.getItem(key) || '[]');
        const prefs = getChatStoragePrefs(userId);
        const currentTime = Date.now();
        
        // Filter out old messages
        const filteredMessages = messages.filter(msg => {
          const messageTime = new Date(msg.sent_at).getTime();
          const age = currentTime - messageTime;
          return age <= prefs.localStorageTimeout;
        });
        
        if (filteredMessages.length < messages.length) {
          // Save filtered messages back or delete entirely if empty
          if (filteredMessages.length > 0) {
            localStorage.setItem(key, JSON.stringify(filteredMessages));
            console.log(`Purged old messages from ${key}`);
          } else {
            localStorage.removeItem(key);
            console.log(`Removed empty chat store ${key}`);
          }
        }
      } catch (error) {
        console.error(`Error processing old messages for ${key}:`, error);
      }
    });
  } catch (error) {
    console.error('Error purging old messages:', error);
  }
};
