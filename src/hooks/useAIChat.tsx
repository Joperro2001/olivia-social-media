
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AIAgent, AIConversation, AIMessage } from '@/types/Chat';
import { v4 as uuidv4 } from 'uuid';

interface UseAIChatProps {
  conversationId?: string;
  agentId?: string;
}

export function useAIChat({ conversationId, agentId }: UseAIChatProps = {}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get or create agent
  const getOrCreateAgent = useCallback(async () => {
    if (!user) return null;
    
    try {
      // Check if agent exists
      const { data: existingAgent, error: fetchError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned
        throw fetchError;
      }

      if (existingAgent) {
        return existingAgent;
      }

      // Create a new agent if none exists
      const { data: newAgent, error: createError } = await supabase
        .from('ai_agents')
        .insert([{
          user_id: user.id,
          name: 'Olivia', 
          description: 'Your relocation assistant'
        }])
        .select('*')
        .single();

      if (createError) throw createError;
      return newAgent;
    } catch (err) {
      console.error('Error getting/creating agent:', err);
      setError('Failed to initialize AI agent');
      return null;
    }
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(async (agentId: string, title: string = "New Conversation") => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          agent_id: agentId,
          title
        }])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create a new conversation');
      return null;
    }
  }, []);

  // Load existing conversation or create a new one
  const loadOrCreateConversation = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First get or create an agent
      const currentAgent = agentId ? 
        await supabase.from('ai_agents').select('*').eq('id', agentId).single().then(res => res.data) : 
        await getOrCreateAgent();
      
      if (!currentAgent) {
        throw new Error('Could not initialize agent');
      }
      
      setAgent(currentAgent);
      
      // Then load or create a conversation
      let currentConversation;
      
      if (conversationId) {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('agent_id', currentAgent.id)
          .single();
        
        if (error) throw error;
        currentConversation = data;
      } else {
        // Create a new conversation
        currentConversation = await createConversation(currentAgent.id);
      }
      
      if (!currentConversation) {
        throw new Error('Could not load or create conversation');
      }
      
      setConversation(currentConversation);
      
      // Load messages for the conversation
      const { data: messageData, error: messagesError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', currentConversation.id)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      setMessages(messageData || []);
      
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [user, agentId, conversationId, getOrCreateAgent, createConversation]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation || !user) return false;
    
    try {
      // Check if the agent exists
      if (!agent) {
        throw new Error('AI agent not initialized');
      }
      
      // Add user message to DB
      const userMessage: AIMessage = {
        id: uuidv4(),
        conversation_id: conversation.id,
        content,
        sender: 'user',
        created_at: new Date().toISOString(),
      };
      
      const { error: sendError } = await supabase
        .from('ai_messages')
        .insert([userMessage]);
      
      if (sendError) throw sendError;
      
      // Optimistically update UI
      setMessages(prev => [...prev, userMessage]);
      
      // Here we would normally make an API call to get AI response
      // For now, we'll simulate a basic AI response
      setTimeout(async () => {
        const aiResponse: AIMessage = {
          id: uuidv4(),
          conversation_id: conversation.id,
          content: getSimulatedResponse(content),
          sender: 'ai',
          created_at: new Date().toISOString(),
        };
        
        const { error: aiError } = await supabase
          .from('ai_messages')
          .insert([aiResponse]);
        
        if (aiError) {
          console.error('Error saving AI response:', aiError);
          return;
        }
        
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [conversation, user, agent]);

  // Simulated AI response function - this would normally be replaced with a real API call
  const getSimulatedResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return "Hello! I'm Olivia, your relocation assistant. How can I help you today?";
    }
    
    if (lowerCaseMessage.includes('city') || lowerCaseMessage.includes('move')) {
      return "Moving to a new city is exciting! I can help you find the perfect location based on your preferences.";
    }
    
    if (lowerCaseMessage.includes('housing') || lowerCaseMessage.includes('apartment')) {
      return "Finding housing can be challenging! I can provide resources for rental options and connect you with local agents in your destination city.";
    }
    
    if (lowerCaseMessage.includes('job') || lowerCaseMessage.includes('work')) {
      return "Looking for work in your new location? I can suggest job boards specific to your industry and city of interest.";
    }
    
    return "Thanks for your message! I'm here to help with your relocation needs. Could you provide more details about what you're looking for?";
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversation) return;
    
    const channel = supabase
      .channel('ai-chat-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        const newMessage = payload.new as AIMessage;
        // Only add message if it's not already in our list
        setMessages(currentMessages => {
          if (currentMessages.find(m => m.id === newMessage.id)) {
            return currentMessages;
          }
          return [...currentMessages, newMessage];
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadOrCreateConversation();
    }
  }, [user, loadOrCreateConversation]);

  return {
    messages,
    conversation,
    agent,
    isLoading,
    error,
    sendMessage,
    createConversation
  };
}
