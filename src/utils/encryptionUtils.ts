
/**
 * Note: This file now only exists for backwards compatibility.
 * Encryption has been removed to simplify the chat functionality.
 */

export const encryptMessage = async (
  content: string,
  userId: string
): Promise<string> => {
  // Simply return the content as is without encryption
  return content;
};

export const decryptMessage = async (
  content: string,
  userId: string
): Promise<string> => {
  // Simply return the content as is without decryption
  return content;
};

export const isEncryptedMessage = (content: string): boolean => {
  // Always return false since we're not encrypting anymore
  return false;
};

export const encryptMessages = async (
  messages: any[],
  userId: string
): Promise<any[]> => {
  // Just return the original messages
  return messages;
};

export const decryptMessages = async (
  messages: any[],
  userId: string
): Promise<any[]> => {
  // Just return the original messages
  return messages;
};
