import { useState, useCallback, useEffect } from 'react';
import type { Message } from '@/components/agent/chat-interface';

const CONTEXT_WINDOW = 10; // From Lab 5

export function useAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [actorId] = useState(() => 'default-user'); // Could be user ID in production

  // Generate conversation ID on client side only to avoid hydration issues
  useEffect(() => {
    setConversationId(crypto.randomUUID());
  }, []);

  // Build context from recent messages (Lab 5 pattern)
  const buildContext = useCallback((messages: Message[], contextWindow = CONTEXT_WINDOW) => {
    const history = messages.length > contextWindow * 2 
      ? messages.slice(-contextWindow * 2) 
      : messages;
    
    let context = '';
    for (const msg of history) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      context += `${role}: ${msg.content}\n`;
    }
    return context;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Wait for conversationId to be generated
    if (!conversationId) {
      console.log('Waiting for conversation ID to be generated...');
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Build context from conversation history (Lab 5 pattern)
      const allMessages = [...messages, userMessage];
      const context = buildContext(allMessages);

      const response = await fetch('/api/agentcore/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          conversationId,
          context, // Send full context
          actorId,
          qualifier: 'DEFAULT' // Optional qualifier parameter
        }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const startTime = Date.now();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'text') {
                accumulatedContent += data.content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (data.type === 'final') {
                // Final formatted response (Lab 5 pattern)
                const elapsed = (Date.now() - startTime) / 1000;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id
                      ? { 
                          ...msg, 
                          content: data.content, 
                          isStreaming: false,
                          elapsed 
                        }
                      : msg
                  )
                );
                break;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const elapsed = (Date.now() - Date.now()) / 1000;
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id
            ? { 
                ...msg, 
                content: error instanceof Error ? 
                  `Error: ${error.message}` : 
                  'Sorry, I encountered an error. Please try again.',
                isStreaming: false,
                elapsed
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId, actorId, buildContext]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    conversationId,
  };
}