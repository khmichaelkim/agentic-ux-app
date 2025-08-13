"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  mockServices, 
  mockDependencies, 
  type ServiceMetrics, 
  type ServiceDependency 
} from "@/lib/mock-data/services";
import { 
  ArrowRight, 
  Database, 
  Layers, 
  Network,
  Zap
} from "lucide-react";

interface ServiceNode extends ServiceMetrics {
  x: number;
  y: number;
}

const ServiceNode = ({ 
  service, 
  index 
}: { 
  service: ServiceNode; 
  index: number; 
}) => {
  const statusColors = {
    healthy: "border-green-500 bg-green-500/10",
    warning: "border-yellow-500 bg-yellow-500/10", 
    critical: "border-red-500 bg-red-500/10"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      className={`
        absolute w-24 h-24 rounded-xl border-2 cursor-pointer
        ${statusColors[service.status]}
        backdrop-blur-sm flex flex-col items-center justify-center
        text-center p-2 transition-all hover:shadow-lg
      `}
      style={{ 
        left: `${service.x}%`, 
        top: `${service.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Network className="h-4 w-4 mb-1" />
      <div className="text-xs font-medium leading-tight">
        {service.name.split(' ')[0]}
      </div>
      <div className="text-[10px] text-muted-foreground">
        {service.platform === 'AWS Lambda' ? 'λ' : 'API'}
      </div>
    </motion.div>
  );
};

const ConnectionLine = ({ 
  connection, 
  index 
}: { 
  connection: ServiceDependency & { fromNode: ServiceNode; toNode: ServiceNode }; 
  index: number; 
}) => {
  const isHealthy = connection.errorRate < 1;
  const strokeColor = isHealthy ? '#10b981' : connection.errorRate > 5 ? '#ef4444' : '#f59e0b';
  const strokeWidth = connection.type === 'sync' ? 2 : 1;
  const strokeDasharray = connection.type === 'sync' ? '0' : '4 2';
  
  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: index * 0.2 }}
    >
      <motion.line
        x1={`${connection.fromNode.x}%`}
        y1={`${connection.fromNode.y}%`}
        x2={`${connection.toNode.x}%`}
        y2={`${connection.toNode.y}%`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        className="drop-shadow-sm"
        animate={{
          strokeOpacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Connection metadata */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 + index * 0.2 }}
      >
        <circle
          cx={`${(connection.fromNode.x + connection.toNode.x) / 2}%`}
          cy={`${(connection.fromNode.y + connection.toNode.y) / 2}%`}
          r="8"
          fill="rgba(0,0,0,0.8)"
          className="backdrop-blur-sm"
        />
        <text
          x={`${(connection.fromNode.x + connection.toNode.x) / 2}%`}
          y={`${(connection.fromNode.y + connection.toNode.y) / 2}%`}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[8px] fill-white font-medium"
        >
          {connection.errorRate.toFixed(1)}%
        </text>
      </motion.g>
    </motion.svg>
  );
};

export function ServiceDependencyMap() {
  // Position services in a logical layout
  const serviceNodes: ServiceNode[] = mockServices.map((service, index) => {
    const positions = [
      { x: 20, y: 50 },  // transaction-data-generator (left)
      { x: 50, y: 30 },  // transaction-processing-api (top center)
      { x: 80, y: 50 },  // transaction-service (right center)
      { x: 65, y: 75 },  // fraud-detection-service (bottom right)
      { x: 95, y: 75 }   // rewards-eligibility-service (far right)
    ];
    
    return {
      ...service,
      ...positions[index]
    };
  });
  
  // Create connections with node references
  const connections = mockDependencies.map(dep => {
    const fromNode = serviceNodes.find(n => n.id === dep.from)!;
    const toNode = serviceNodes.find(n => n.id === dep.to)!;
    return { ...dep, fromNode, toNode };
  });
  
  const totalServices = serviceNodes.length;
  const totalConnections = connections.length;
  const avgLatency = connections.reduce((sum, c) => sum + c.latency, 0) / connections.length;
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-2">Service Dependency Map</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-3 w-3" />
            <span>{totalServices} Services</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3" />
            <span>{totalConnections} Dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>Avg {avgLatency.toFixed(0)}ms</span>
          </div>
        </div>
      </motion.div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Service Architecture
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <div className="w-2 h-0.5 bg-current"></div>
                Sync
              </Badge>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <div className="w-2 h-0.5 bg-current opacity-50" style={{backgroundImage: 'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)'}}></div>
                Async
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <motion.div 
            className="relative h-80 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background grid */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Connection lines */}
            {connections.map((connection, index) => (
              <ConnectionLine 
                key={`${connection.from}-${connection.to}`}
                connection={connection} 
                index={index}
              />
            ))}
            
            {/* Service nodes */}
            {serviceNodes.map((service, index) => (
              <ServiceNode 
                key={service.id} 
                service={service} 
                index={index}
              />
            ))}
          </motion.div>
          
          {/* Legend */}
          <motion.div 
            className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/10"></div>
              <span>Healthy (&lt;1% errors)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-yellow-500 bg-yellow-500/10"></div>
              <span>Warning (1-5% errors)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-red-500 bg-red-500/10"></div>
              <span>Critical (&gt;5% errors)</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}