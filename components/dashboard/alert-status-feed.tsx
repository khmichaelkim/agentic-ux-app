"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockAlerts, type Alert } from "@/lib/mock-data/services";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Flame,
  Info,
  Shield
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const AlertIcon = ({ severity, status }: { severity: Alert['severity']; status: Alert['status'] }) => {
  if (status === 'resolved') {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
  
  const config = {
    low: { icon: Info, color: "text-blue-500" },
    medium: { icon: AlertTriangle, color: "text-yellow-500" },
    high: { icon: AlertCircle, color: "text-orange-500" },
    critical: { icon: Flame, color: "text-red-500" }
  };
  
  const { icon: Icon, color } = config[severity];
  
  return (
    <motion.div
      animate={severity === 'critical' && status === 'firing' ? {
        scale: [1, 1.2, 1],
      } : {}}
      transition={{
        duration: 1,
        repeat: severity === 'critical' && status === 'firing' ? Infinity : 0,
      }}
    >
      <Icon className={`h-4 w-4 ${color}`} />
    </motion.div>
  );
};

const AlertCard = ({ 
  alert, 
  index 
}: { 
  alert: Alert; 
  index: number; 
}) => {
  const severityColors = {
    low: "border-l-blue-500",
    medium: "border-l-yellow-500",
    high: "border-l-orange-500",
    critical: "border-l-red-500"
  };
  
  const isActive = alert.status === 'firing';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.01, x: 4 }}
    >
      <Card className={`
        border-l-4 ${severityColors[alert.severity]} 
        ${isActive ? 'bg-card' : 'bg-muted/30'} 
        transition-all
      `}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertIcon severity={alert.severity} status={alert.status} />
              <div>
                <h4 className={`text-sm font-medium ${!isActive ? 'text-muted-foreground' : ''}`}>
                  {alert.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {alert.service}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isActive ? 
                  (alert.severity === 'critical' ? "destructive" : "secondary") : 
                  "outline"
                } 
                className="text-xs capitalize"
              >
                {alert.status}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {alert.severity}
              </Badge>
            </div>
          </div>
          
          <p className={`text-sm mb-3 ${!isActive ? 'text-muted-foreground' : ''}`}>
            {alert.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AlertSummaryCard = ({ 
  title, 
  count, 
  icon: Icon, 
  color,
  bgColor,
  index 
}: {
  title: string;
  count: number;
  icon: any;
  color: string;
  bgColor: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-full ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground">{title}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function AlertStatusFeed() {
  const firingAlerts = mockAlerts.filter(a => a.status === 'firing');
  const resolvedAlerts = mockAlerts.filter(a => a.status === 'resolved');
  
  const criticalCount = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'firing').length;
  const highCount = mockAlerts.filter(a => a.severity === 'high' && a.status === 'firing').length;
  const mediumCount = mockAlerts.filter(a => a.severity === 'medium' && a.status === 'firing').length;
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-2">Alert Status Feed</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>{firingAlerts.length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>{resolvedAlerts.length} Resolved</span>
          </div>
        </div>
      </motion.div>
      
      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <AlertSummaryCard
          title="Critical"
          count={criticalCount}
          icon={Flame}
          color="text-red-500"
          bgColor="bg-red-500/20"
          index={0}
        />
        <AlertSummaryCard
          title="High"
          count={highCount}
          icon={AlertCircle}
          color="text-orange-500"
          bgColor="bg-orange-500/20"
          index={1}
        />
        <AlertSummaryCard
          title="Medium"
          count={mediumCount}
          icon={AlertTriangle}
          color="text-yellow-500"
          bgColor="bg-yellow-500/20"
          index={2}
        />
        <AlertSummaryCard
          title="Total Active"
          count={firingAlerts.length}
          icon={Shield}
          color="text-blue-500"
          bgColor="bg-blue-500/20"
          index={3}
        />
      </div>
      
      {/* Alert Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Active Alerts */}
            {firingAlerts.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Flame className="h-3 w-3 text-red-500" />
                  Active Alerts
                </div>
                <AnimatePresence>
                  {firingAlerts.map((alert, index) => (
                    <AlertCard key={alert.id} alert={alert} index={index} />
                  ))}
                </AnimatePresence>
              </>
            )}
            
            {/* Separator */}
            {firingAlerts.length > 0 && resolvedAlerts.length > 0 && (
              <Separator className="my-4" />
            )}
            
            {/* Resolved Alerts */}
            {resolvedAlerts.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Recently Resolved
                </div>
                <AnimatePresence>
                  {resolvedAlerts.map((alert, index) => (
                    <AlertCard key={alert.id} alert={alert} index={index + firingAlerts.length} />
                  ))}
                </AnimatePresence>
              </>
            )}
            
            {/* Empty state */}
            {mockAlerts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No alerts at this time</p>
                <p className="text-xs">All systems are operating normally</p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}