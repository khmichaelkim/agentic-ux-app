"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockAlerts, type Alert } from "@/lib/mock-data/services";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Flame,
  X,
  Bell
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const AlertBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const activeAlerts = mockAlerts.filter(a => a.status === 'firing');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const highAlerts = activeAlerts.filter(a => a.severity === 'high');
  const mediumAlerts = activeAlerts.filter(a => a.severity === 'medium');
  
  // Don't show banner if no active alerts or if dismissed
  if (activeAlerts.length === 0 || isDismissed) {
    return null;
  }
  
  // Determine banner color based on highest severity
  const hasCritical = criticalAlerts.length > 0;
  const hasHigh = highAlerts.length > 0;
  
  const bannerConfig = hasCritical ? {
    bgColor: "bg-red-500/10 border-red-500/20",
    textColor: "text-red-700 dark:text-red-300",
    iconColor: "text-red-500",
    icon: Flame,
    pulse: true
  } : hasHigh ? {
    bgColor: "bg-orange-500/10 border-orange-500/20", 
    textColor: "text-orange-700 dark:text-orange-300",
    iconColor: "text-orange-500",
    icon: AlertCircle,
    pulse: false
  } : {
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    textColor: "text-yellow-700 dark:text-yellow-300", 
    iconColor: "text-yellow-500",
    icon: AlertTriangle,
    pulse: false
  };
  
  const { bgColor, textColor, iconColor, icon: Icon, pulse } = bannerConfig;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border-b ${bgColor} backdrop-blur-sm`}
    >
      <div className="container mx-auto px-6 py-3">
        {/* Collapsed state */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={pulse ? { scale: [1, 1.1, 1] } : {}}
              transition={pulse ? { duration: 2, repeat: Infinity } : {}}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </motion.div>
            
            <div className="flex items-center gap-2">
              <span className={`font-medium ${textColor}`}>
                {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? 's' : ''}
              </span>
              
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalAlerts.length} Critical
                </Badge>
              )}
              
              {highAlerts.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-700 dark:text-orange-300">
                  {highAlerts.length} High
                </Badge>
              )}
              
              {mediumAlerts.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {mediumAlerts.length} Medium
                </Badge>
              )}
            </div>
            
            <span className={`text-sm ${textColor} opacity-80`}>
              Most recent: {formatDistanceToNow(activeAlerts[0].timestamp, { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs ${textColor} hover:bg-current/10`}
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
              {isExpanded ? 
                <ChevronUp className="h-3 w-3 ml-1" /> : 
                <ChevronDown className="h-3 w-3 ml-1" />
              }
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className={`text-xs ${textColor} hover:bg-current/10`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3"
            >
              {/* Alert summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {criticalAlerts.length > 0 && (
                  <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Critical</span>
                        <Badge variant="destructive" className="text-xs">
                          {criticalAlerts.length}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {criticalAlerts[0].title}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {highAlerts.length > 0 && (
                  <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">High</span>
                        <Badge variant="secondary" className="text-xs bg-orange-500/20">
                          {highAlerts.length}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {highAlerts[0].title}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {mediumAlerts.length > 0 && (
                  <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Medium</span>
                        <Badge variant="outline" className="text-xs">
                          {mediumAlerts.length}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mediumAlerts[0].title}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Quick action note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bell className="h-3 w-3" />
                <span>
                  View full alert details in the{" "}
                  <a 
                    href="#alert-status-feed" 
                    className="text-primary hover:underline font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('alert-status-feed')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                  >
                    Alert Status Feed
                  </a>
                  {" "}below
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AlertBanner;