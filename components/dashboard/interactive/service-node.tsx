"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion } from "framer-motion";
import { 
  Network, 
  Database, 
  Layers, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type ServiceMetrics } from "@/lib/mock-data/services";

export interface ServiceNodeData extends ServiceMetrics {
  selected?: boolean;
}

const ServiceNode = memo(({ data, selected }: NodeProps<ServiceNodeData>) => {
  const statusColors = {
    healthy: "border-green-500 bg-green-500/10 text-green-700",
    warning: "border-yellow-500 bg-yellow-500/10 text-yellow-700", 
    critical: "border-red-500 bg-red-500/10 text-red-700"
  };

  const statusIcons = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle
  };

  const StatusIcon = statusIcons[data.status];

  const platformIcon = data.platform === 'AWS Lambda' ? Database : 
                      data.platform === 'API Gateway' ? Network : Layers;
  const PlatformIcon = platformIcon;

  return (
    <>
      {/* Connection handles */}
      <Handle 
        type="target" 
        position={Position.Top}
        className="w-3 h-3 !bg-muted-foreground border-2 border-background"
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        className="w-3 h-3 !bg-muted-foreground border-2 border-background"
      />
      
      {/* Node content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        className={`
          relative px-4 py-3 rounded-xl border-2 cursor-pointer
          ${statusColors[data.status]}
          ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
          backdrop-blur-sm shadow-lg hover:shadow-xl
          transition-all duration-200 ease-in-out
          min-w-[140px] max-w-[200px]
        `}
      >
        {/* Header with status indicator */}
        <div className="flex items-center gap-2 mb-2">
          <StatusIcon className="h-4 w-4" />
          <PlatformIcon className="h-4 w-4" />
          <Badge variant="outline" className="text-xs px-1 py-0">
            {data.platform === 'AWS Lambda' ? 'λ' : 'API'}
          </Badge>
        </div>

        {/* Service name */}
        <div className="font-semibold text-sm mb-1 leading-tight">
          {data.name}
        </div>

        {/* Environment */}
        <div className="text-xs text-muted-foreground mb-2">
          {data.environment}
        </div>

        {/* Metrics */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Errors:</span>
            <span className={`font-medium ${
              data.errorRate > 5 ? 'text-red-600' : 
              data.errorRate > 1 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {Math.round(data.errorRate)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">P99:</span>
            <span className="font-medium">
              {data.latencyP99}ms
            </span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">RPS:</span>
            <span className="font-medium">
              {data.throughput}
            </span>
          </div>
        </div>

        {/* Uptime indicator */}
        <div className="mt-2 pt-2 border-t border-current/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Uptime:</span>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span className="font-medium">{Math.round(data.uptime)}%</span>
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -inset-1 bg-primary/20 rounded-xl -z-10"
          />
        )}
      </motion.div>
    </>
  );
});

ServiceNode.displayName = 'ServiceNode';

export default ServiceNode;