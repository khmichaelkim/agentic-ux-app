"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User, Clock, Sparkles } from "lucide-react";
import type { Message } from "./chat-interface";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar className={`h-8 w-8 ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-emerald-500 to-teal-600'
      }`}>
        <AvatarFallback className="bg-transparent text-white">
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <Card className={`max-w-[80%] p-4 border-0 shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-500/20' 
          : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-emerald-500/20'
      }`}>
        <div className={`text-sm ${isUser ? 'text-blue-100' : 'text-slate-100'}`}>
          <MessageContent 
            content={message.content} 
            isStreaming={message.isStreaming} 
          />
        </div>
        <div className="flex items-center gap-2 text-xs mt-2">
          <span className={isUser ? 'text-blue-300/70' : 'text-emerald-400/70'}>
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.elapsed && (
            <>
              <Clock className={`h-3 w-3 ${isUser ? 'text-blue-300/70' : 'text-emerald-400/70'}`} />
              <span className={isUser ? 'text-blue-300/70' : 'text-emerald-400/70'}>
                {message.elapsed.toFixed(2)}s
              </span>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const makeUrlsClickable = (text: string) => {
    const urlPattern = /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*))?/g;
    return text.replace(urlPattern, (url) => 
      `<a href="${url}" target="_blank" class="text-blue-400 hover:text-blue-300 underline">${url}</a>`
    );
  };

  const processedContent = makeUrlsClickable(content);
  
  return (
    <div 
      className={isStreaming ? 'typing-cursor' : ''}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}