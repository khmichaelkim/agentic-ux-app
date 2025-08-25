"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Settings, 
  Bell, 
  User,
  Activity,
  Cloud,
  Target,
  ArrowLeft,
  Beaker,
  Bot
} from "lucide-react";

// Import SLO-specific components
import { SLOSummary } from "@/components/dashboard/slo-summary";
import { SLOList } from "@/components/dashboard/slo-list";
import { SLOChatInterface } from "@/components/dashboard/slo-chat-interface";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              <Target className="h-6 w-6 text-blue-500" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold">Service Level Objectives</h1>
              <p className="text-sm text-muted-foreground">
                Monitor and manage your SLO performance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
              <Badge variant="outline" className="text-xs">
                Region: us-east-1
              </Badge>
            </motion.div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1">
              <Link href="/agent">
                <Button variant="ghost" size="sm" title="Agent Chat">
                  <Bot className="h-4 w-4 text-blue-500" />
                </Button>
              </Link>
              <Link href="/test-aws">
                <Button variant="ghost" size="sm" title="AWS Test Page">
                  <Beaker className="h-4 w-4 text-green-500" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default function SLOsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-4">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)]">
          {/* Left Sidebar - Summary and List */}
          <motion.div 
            className="col-span-4 space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* SLO Summary */}
            <SLOSummary />
            
            {/* SLO List */}
            <SLOList />
          </motion.div>
          
          {/* Right Main Area - Chat Interface */}
          <motion.div 
            className="col-span-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SLOChatInterface />
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground"
        >
          <p>AWS SLO Dashboard • Powered by Application Signals</p>
        </motion.footer>
      </main>
    </div>
  );
}