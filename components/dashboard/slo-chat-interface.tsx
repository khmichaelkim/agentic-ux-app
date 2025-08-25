"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Bot, 
  Send, 
  Target,
  AlertCircle,
  TrendingUp,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const mockResponses = [
  "I can help you analyze your SLO performance. Which service are you most concerned about?",
  "Based on your current metrics, the Transaction API needs immediate attention. The error rate is at 8.7% which is causing the availability SLO to breach.",
  "Here are some recommendations to improve your SLO compliance:\n\n1. **Transaction API**: Implement circuit breakers to reduce error rate\n2. **Error Budget**: You have 0% remaining - consider temporary rate limiting\n3. **Monitoring**: Add alerting for error rates above 5%",
  "The Fraud Detection Service is performing well with 85% error budget remaining. You could optimize it further by reducing the latency target from 1500ms to 1200ms.",
  "Your overall SLO health shows 2 breaching, 2 at risk, and 4 meeting targets. Focus on the breaching ones first for maximum impact.",
];

export function SLOChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm your SLO Assistant. I can help you analyze service level objectives, troubleshoot breaching SLOs, and recommend improvements to your error budgets. What would you like to know about your SLOs?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: "Analyze breaching SLOs", icon: AlertCircle, color: "text-red-500" },
    { label: "Error budget analysis", icon: Target, color: "text-blue-500" },
    { label: "Performance trends", icon: TrendingUp, color: "text-green-500" },
    { label: "Optimization tips", icon: Lightbulb, color: "text-yellow-500" }
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-border/50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              SLO Assistant
            </span>
          </div>
          <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 border-green-500/30">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Online
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3"
              >
                <Avatar className={`h-8 w-8 ${message.role === 'assistant' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
                  <AvatarFallback className="bg-transparent text-white text-xs">
                    {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Card className={`max-w-[85%] p-3 ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20' 
                    : 'bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20'
                }`}>
                  <div className={`text-sm whitespace-pre-wrap ${
                    message.role === 'assistant' ? 'text-blue-100' : 'text-gray-100'
                  }`}>
                    {message.content}
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600">
                  <AvatarFallback className="bg-transparent text-white">
                    <Bot className="h-4 w-4 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-[80%] p-3 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Analyzing your SLOs...</span>
                  </div>
                </Card>
              </motion.div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        
        {/* Quick Actions */}
        <div className="px-6 py-3 border-t border-border/50">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSend(action.label)}
                  className="text-xs border-border/50 hover:border-border"
                  disabled={isLoading}
                >
                  <action.icon className={`h-3 w-3 mr-1 ${action.color}`} />
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Input */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your SLOs..."
              disabled={isLoading}
              className="flex-1 border-border/50 focus:border-blue-500/50"
            />
            <Button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}