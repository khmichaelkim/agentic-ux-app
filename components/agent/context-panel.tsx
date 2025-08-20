"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Shield,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

interface AgentContextPanelProps {
  onSendMessage: (message: string) => void;
}

export function AgentContextPanel({ onSendMessage }: AgentContextPanelProps) {
  const quickActions = [
    {
      icon: Activity,
      label: "Service Health",
      prompt: "Show me a comprehensive health overview of all my AWS services",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: AlertTriangle,
      label: "Error Analysis", 
      prompt: "Analyze any services with high error rates and suggest solutions",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: TrendingUp,
      label: "Performance Trends",
      prompt: "What are the performance trends for my critical services?",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Shield,
      label: "SLO Status",
      prompt: "Check the status of my SLOs and identify any at-risk objectives",
      color: "from-purple-500 to-violet-600"
    }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-semibold">
              Quick Actions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
              key={index}
              variant="outline" 
              size="sm" 
              className="w-full justify-start group hover:border-slate-500 bg-slate-800/50 border-slate-700/50 transition-all"
              onClick={() => onSendMessage(action.prompt)}
            >
              <div className={`p-1 rounded bg-gradient-to-r ${action.color} mr-2`}>
                <action.icon className="h-3 w-3 text-white" />
              </div>
              <span className="text-slate-200">{action.label}</span>
              <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </Button>
            </motion.div>
          ))}
        </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Activity className="h-3 w-3 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
              Sample Queries
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <motion.div 
            className="p-2 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded border border-purple-500/20 text-purple-200 hover:border-purple-400/30 transition-colors cursor-pointer"
            onClick={() => onSendMessage("What's the current status of my payment service?")}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            &quot;What&apos;s the current status of my payment service?&quot;
          </motion.div>
          <motion.div 
            className="p-2 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded border border-blue-500/20 text-blue-200 hover:border-blue-400/30 transition-colors cursor-pointer"
            onClick={() => onSendMessage("Show me latency trends for the last 24 hours")}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            &quot;Show me latency trends for the last 24 hours&quot;
          </motion.div>
          <motion.div 
            className="p-2 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded border border-orange-500/20 text-orange-200 hover:border-orange-400/30 transition-colors cursor-pointer"
            onClick={() => onSendMessage("Which services have the highest error rates?")}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            &quot;Which services have the highest error rates?&quot;
          </motion.div>
          <motion.div 
            className="p-2 bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded border border-green-500/20 text-green-200 hover:border-green-400/30 transition-colors cursor-pointer"
            onClick={() => onSendMessage("Help me troubleshoot slow API responses")}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            &quot;Help me troubleshoot slow API responses&quot;
          </motion.div>
        </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}