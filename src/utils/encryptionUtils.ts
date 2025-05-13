
/**
 * Utilities for client-side encryption/decryption of chat messages
 * using the Web Crypto API
 */

// Generate a encryption key from a user-specific value
const getEncryptionKey = async (userId: string): Promise<CryptoKey> => {
  // Use the user ID as seed for the key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(`${userId}-secure-messaging-key`);
  
  // Hash the key data to get consistent length
  const keyHash = await crypto.subtle.digest('SHA-256', keyData);
  
  // Import the key for AES-GCM encryption
  return crypto.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
};

// Encrypt message content
export const encryptMessage = async (
  content: string,
  userId: string
): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    // Generate initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getEncryptionKey(userId);
    
    // Encrypt the content
    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine IV and encrypted content for storage
    const encryptedBuffer = new Uint8Array(iv.length + encryptedContent.byteLength);
    encryptedBuffer.set(iv);
    encryptedBuffer.set(new Uint8Array(encryptedContent), iv.length);
    
    // Convert to base64 for storage
    return btoa(
      String.fromCharCode.apply(null, Array.from(encryptedBuffer))
    );
  } catch (error) {
    console.error('Encryption error:', error);
    return content; // Fallback to unencrypted on error
  }
};

// Decrypt message content
export const decryptMessage = async (
  encryptedContent: string,
  userId: string
): Promise<string> => {
  try {
    // Check if content appears to be encrypted
    if (!encryptedContent.match(/^[a-zA-Z0-9+/]+={0,2}$/)) {
      return encryptedContent; // Return as is if not base64
    }
    
    // Decode base64 to array buffer
    const rawData = atob(encryptedContent);
    const encryptedBuffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      encryptedBuffer[i] = rawData.charCodeAt(i);
    }
    
    // Extract IV and encrypted data
    const iv = encryptedBuffer.slice(0, 12);
    const data = encryptedBuffer.slice(12);
    
    const key = await getEncryptionKey(userId);
    
    // Decrypt the content
    const decryptedContent = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Decode to string
    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error('Decryption error:', error);
    return `[Encrypted message]`; // Safety fallback
  }
};

// Check if a message appears to be encrypted
export const isEncryptedMessage = (content: string): boolean => {
  return !!content.match(/^[a-zA-Z0-9+/]+={0,2}$/);
};

// Batch encrypt multiple messages
export const encryptMessages = async (
  messages: any[],
  userId: string
): Promise<any[]> => {
  return Promise.all(
    messages.map(async (msg) => ({
      ...msg,
      content: await encryptMessage(msg.content, userId)
    }))
  );
};

// Batch decrypt multiple messages
export const decryptMessages = async (
  messages: any[],
  userId: string
): Promise<any[]> => {
  return Promise.all(
    messages.map(async (msg) => ({
      ...msg,
      content: await decryptMessage(msg.content, userId)
    }))
  );
};
