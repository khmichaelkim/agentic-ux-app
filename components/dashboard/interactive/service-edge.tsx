"use client";

import { memo } from "react";
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from "reactflow";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { type ServiceDependency } from "@/lib/mock-data/services";

export interface ServiceEdgeData extends ServiceDependency {
  selected?: boolean;
}

const ServiceEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}: EdgeProps<ServiceEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Dynamic styling based on health and type
  const isHealthy = data.errorRate < 1;
  const strokeColor = isHealthy ? '#10b981' : 
                     data.errorRate > 5 ? '#ef4444' : '#f59e0b';
  const strokeWidth = data.type === 'sync' ? 3 : 2;
  const strokeDasharray = data.type === 'sync' ? '0' : '8 4';
  
  // Enhanced styling for selection
  const effectiveStrokeWidth = selected ? strokeWidth + 1 : strokeWidth;
  const glowIntensity = selected ? 4 : 2;

  return (
    <>
      {/* Glow effect */}
      <motion.path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={effectiveStrokeWidth + glowIntensity}
        strokeDasharray={strokeDasharray}
        opacity={0.3}
        className="pointer-events-none"
        animate={{
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main edge path */}
      <motion.path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={effectiveStrokeWidth}
        strokeDasharray={strokeDasharray}
        className="react-flow__edge-path cursor-pointer hover:stroke-opacity-80"
        animate={{
          strokeOpacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Selection indicator */}
      {selected && (
        <motion.path
          d={edgePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={effectiveStrokeWidth + 2}
          strokeDasharray={strokeDasharray}
          opacity={0.5}
          className="pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        />
      )}

      {/* Edge label with metrics */}
      <EdgeLabelRenderer>
        <motion.div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.1 }}
          className="nodrag nopan"
        >
          <div className="flex items-center gap-2">
            {/* Error rate badge */}
            <Badge 
              variant={isHealthy ? "default" : data.errorRate > 5 ? "destructive" : "secondary"}
              className="text-xs px-2 py-1 font-medium shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: `${strokeColor}20`,
                borderColor: strokeColor,
                color: strokeColor
              }}
            >
              {Math.round(data.errorRate)}% errors
            </Badge>
            
            {/* Latency badge */}
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-1 bg-background/80 backdrop-blur-sm shadow-lg"
            >
              {data.latency}ms
            </Badge>
            
            {/* Connection type indicator */}
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-1 bg-background/80 backdrop-blur-sm shadow-lg"
            >
              {data.type}
            </Badge>
          </div>
        </motion.div>
      </EdgeLabelRenderer>

      {/* Animated flow particles for sync connections */}
      {data.type === 'sync' && (
        <motion.circle
          r="3"
          fill={strokeColor}
          className="pointer-events-none"
        >
          <motion.animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </motion.circle>
      )}

      {/* Pulse effect for async connections */}
      {data.type === 'async' && (
        <motion.circle
          cx={labelX}
          cy={labelY}
          r="0"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          opacity="0.6"
          animate={{
            r: [0, 20, 0],
            opacity: [0.6, 0, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </>
  );
});

ServiceEdge.displayName = 'ServiceEdge';

export default ServiceEdge;