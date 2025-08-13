"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockServices, type ServiceMetrics } from "@/lib/mock-data/services";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap
} from "lucide-react";

const StatusIcon = ({ status }: { status: ServiceMetrics['status'] }) => {
  const config = {
    healthy: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/20" },
    warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/20" },
    critical: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/20" }
  };
  
  const { icon: Icon, color, bg } = config[status];
  
  return (
    <motion.div 
      className={`p-2 rounded-full ${bg}`}
      animate={{ 
        scale: status === 'critical' ? [1, 1.1, 1] : 1,
      }}
      transition={{ 
        duration: 2, 
        repeat: status === 'critical' ? Infinity : 0 
      }}
    >
      <Icon className={`h-4 w-4 ${color}`} />
    </motion.div>
  );
};

const MetricCard = ({ 
  service, 
  index 
}: { 
  service: ServiceMetrics; 
  index: number; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className="border-border/50 hover:border-border transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon status={service.status} />
              <div>
                <CardTitle className="text-sm font-medium">
                  {service.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {service.environment}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {service.platform}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <motion.div 
              className="space-y-1"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span>Error Rate</span>
              </div>
              <div className={`font-semibold ${
                service.errorRate > 5 ? 'text-red-500' : 
                service.errorRate > 1 ? 'text-yellow-500' : 
                'text-green-500'
              }`}>
                {service.errorRate.toFixed(2)}%
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-1"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>P99 Latency</span>
              </div>
              <div className={`font-semibold ${
                service.latencyP99 > 2000 ? 'text-red-500' : 
                service.latencyP99 > 1000 ? 'text-yellow-500' : 
                'text-green-500'
              }`}>
                {service.latencyP99}ms
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-1"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Throughput</span>
              </div>
              <div className="font-semibold text-blue-500">
                {service.throughput.toLocaleString()}/min
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-1"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>Uptime</span>
              </div>
              <div className={`font-semibold ${
                service.uptime < 98 ? 'text-red-500' : 
                service.uptime < 99.5 ? 'text-yellow-500' : 
                'text-green-500'
              }`}>
                {service.uptime.toFixed(2)}%
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Updated {Math.floor((Date.now() - service.lastUpdate.getTime()) / 1000)}s ago
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function ServiceHealthOverview() {
  const healthyCount = mockServices.filter(s => s.status === 'healthy').length;
  const warningCount = mockServices.filter(s => s.status === 'warning').length; 
  const criticalCount = mockServices.filter(s => s.status === 'critical').length;
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-2">Service Health Overview</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>{healthyCount} Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>{warningCount} Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>{criticalCount} Critical</span>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {mockServices.map((service, index) => (
          <MetricCard 
            key={service.id} 
            service={service} 
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}