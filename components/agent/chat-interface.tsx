"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  elapsed?: number;
}

interface AgentChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  conversationId: string;
}

export function AgentChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading,
  conversationId 
}: AgentChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Check if we have a streaming message
  const hasStreamingMessage = messages.some(msg => msg.isStreaming && msg.content);
  const showLoadingIndicator = isLoading && !hasStreamingMessage;
  
  return (
    <Card className="h-[700px] flex flex-col overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-b border-slate-700/50 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent font-semibold">
              Harvey
            </span>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-400 border-green-500/30">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Connected
            </span>
          </Badge>
          {conversationId && (
            <span className="text-xs text-slate-400 ml-2 font-mono">
              {conversationId.slice(0, 8)}...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Thinking bubble when loading - only show if no streaming message */}
            {showLoadingIndicator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-500 to-indigo-600">
                  <AvatarFallback className="bg-transparent text-white">
                    <Bot className="h-4 w-4 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-[80%] p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/20">
                  <div className="flex items-center gap-2 text-sm text-purple-200">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                      Agent is analyzing...
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}
            
            {/* Invisible element for auto-scroll */}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        
        <ChatInput onSend={onSendMessage} disabled={isLoading} />
      </CardContent>
    </Card>
  );
}