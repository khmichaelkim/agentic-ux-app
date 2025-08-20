"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useAgentChat } from "@/lib/hooks/use-agent-chat";
import { AgentChatInterface } from "@/components/agent/chat-interface";
import { AgentContextPanel } from "@/components/agent/context-panel";

export default function AgentPage() {
  const { messages, sendMessage, isLoading, conversationId } = useAgentChat();

  return (
    <motion.div 
      className="container mx-auto p-8 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <motion.div 
            className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Bot className="h-8 w-8 text-white" />
          </motion.div>
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
            AWS Observability Agent
          </span>
        </h1>
        <motion.p 
          className="text-slate-400 ml-14"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          AI-powered insights for your AWS infrastructure using 
          <span className="text-purple-400 font-semibold"> AgentCore Runtime</span>
        </motion.p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Chat Interface - Main Column */}
        <div className="lg:col-span-3">
          <AgentChatInterface 
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            conversationId={conversationId}
          />
        </div>

        {/* Context Panel - Side Column */}
        <div className="lg:col-span-1">
          <AgentContextPanel onSendMessage={sendMessage} />
        </div>
      </motion.div>
    </motion.div>
  );
}