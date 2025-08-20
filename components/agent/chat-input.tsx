"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div 
      className="p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-900/30 to-transparent"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-2">
        <motion.div 
          className="flex-1"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            placeholder="Ask Harvey about your AWS infrastructure..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="flex-1 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/50"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleSubmit} 
            disabled={disabled || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white border-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}