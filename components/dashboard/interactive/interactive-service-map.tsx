"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  Panel,
  NodeChange,
  EdgeChange,
  SelectionMode,
  useOnSelectionChange,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Move3D,
  Grid3X3,
  GitBranch,
  Layers,
  Settings,
  RefreshCw,
  ArrowRight,
  Zap,
  Play,
  Pause,
  Activity
} from "lucide-react";

import ServiceNode from "./service-node";
import ServiceEdge, { ServiceEdgeData } from "./service-edge";
import { 
  convertToReactFlow, 
  applyLayout, 
  LayoutType,
  ServiceNode as ServiceNodeType,
  ServiceEdge as ServiceEdgeType
} from "./layout-utils";
import { mockServices, mockDependencies } from "@/lib/mock-data/services";

// Node and edge types
const nodeTypes = {
  serviceNode: ServiceNode,
};

const edgeTypes = {
  serviceEdge: ServiceEdge,
};

// Control panel component
function MapControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  
  return (
    <Panel position="top-right" className="flex flex-col gap-1">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-1 bg-background/80 backdrop-blur-sm rounded-lg border p-1 shadow-lg"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => zoomIn()}
          className="h-8 w-8 p-0"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => zoomOut()}
          className="h-8 w-8 p-0"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fitView({ padding: 0.2 })}
          className="h-8 w-8 p-0"
          title="Fit view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </motion.div>
    </Panel>
  );
}

// Layout selector component
interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  isAnimating: boolean;
}

function LayoutSelector({ currentLayout, onLayoutChange, isAnimating }: LayoutSelectorProps) {
  const layouts: { type: LayoutType; icon: any; label: string }[] = [
    { type: 'dagre', icon: GitBranch, label: 'Auto Layout' },
    { type: 'hierarchical', icon: Layers, label: 'Hierarchical' },
    { type: 'force', icon: Move3D, label: 'Force Directed' },
    { type: 'grid', icon: Grid3X3, label: 'Grid' },
  ];

  return (
    <Panel position="top-left" className="flex gap-1">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg border p-1 shadow-lg"
      >
        {layouts.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            variant={currentLayout === type ? "default" : "ghost"}
            size="sm"
            onClick={() => onLayoutChange(type)}
            disabled={isAnimating}
            className="h-8 px-2"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </motion.div>
    </Panel>
  );
}

// Main interactive service map component
function InteractiveServiceMapContent() {
  const { fitView } = useReactFlow();
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('dagre');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  // Convert mock data to React Flow format
  const initialData = useMemo(() => {
    const { nodes, edges } = convertToReactFlow(mockServices, mockDependencies);
    return applyLayout(nodes, edges, currentLayout);
  }, [currentLayout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  // Handle selection changes
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes.map(node => node.id));
      setSelectedEdges(edges.map(edge => edge.id));
    },
  });

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle layout changes
  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    if (newLayout === currentLayout || isAnimating) return;
    
    setIsAnimating(true);
    setCurrentLayout(newLayout);
    
    const { nodes: layoutedNodes } = applyLayout(nodes, edges, newLayout);
    
    // Animate to new positions
    setNodes(layoutedNodes);
    
    setTimeout(() => {
      setIsAnimating(false);
      fitView({ padding: 0.2, duration: 800 });
    }, 500);
  }, [currentLayout, isAnimating, nodes, edges, setNodes, fitView]);

  // Real-time data updates simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      setNodes(nodes => 
        nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            errorRate: Math.max(0, node.data.errorRate + (Math.random() - 0.5) * 0.5),
            latencyP99: Math.max(0, node.data.latencyP99 + (Math.random() - 0.5) * 100),
            throughput: Math.max(0, node.data.throughput + (Math.random() - 0.5) * 50),
            lastUpdate: new Date(),
          }
        }))
      );

      setEdges(edges =>
        edges.map(edge => ({
          ...edge,
          data: edge.data ? {
            ...edge.data,
            errorRate: Math.max(0, edge.data.errorRate + (Math.random() - 0.5) * 0.3),
            latency: Math.max(0, edge.data.latency + (Math.random() - 0.5) * 50),
          } : edge.data
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, setNodes, setEdges]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalServices = nodes.length;
    const totalConnections = edges.length;
    const avgLatency = edges.reduce((sum, edge) => sum + (edge.data?.latency || 0), 0) / edges.length || 0;
    const healthyServices = nodes.filter(node => node.data.status === 'healthy').length;
    
    return {
      totalServices,
      totalConnections,
      avgLatency: Math.round(avgLatency),
      healthyServices,
      healthPercentage: Math.round((healthyServices / totalServices) * 100) || 0
    };
  }, [nodes, edges]);

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null} // Disable deletion
        className="bg-gradient-to-br from-muted/30 to-muted/10"
      >
        {/* Background with dots pattern */}
        <Background 
          variant={BackgroundVariant.Dots}
          gap={25}
          size={1.5}
          className="opacity-40"
        />

        {/* Built-in controls */}
        <Controls 
          showInteractive={false}
          className="bg-background/80 backdrop-blur-sm border rounded-lg"
        />

        {/* Minimap */}
        <MiniMap 
          nodeColor={(node) => {
            const serviceNode = node as ServiceNodeType;
            return serviceNode.data.status === 'healthy' ? '#10b981' :
                   serviceNode.data.status === 'warning' ? '#f59e0b' : '#ef4444';
          }}
          maskColor="rgba(0,0,0,0.1)"
          className="bg-background/80 backdrop-blur-sm border rounded-lg"
          pannable
          zoomable
        />

        {/* Custom controls */}
        <MapControls />
        <LayoutSelector 
          currentLayout={currentLayout}
          onLayoutChange={handleLayoutChange}
          isAnimating={isAnimating}
        />

        {/* Stats panel */}
        <Panel position="bottom-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background/80 backdrop-blur-sm rounded-lg border p-3 shadow-lg min-w-[200px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Live Stats</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                className="h-6 w-6 p-0 ml-auto"
              >
                {isRealTimeEnabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Services:</span>
                <span className="font-medium">{stats.totalServices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dependencies:</span>
                <span className="font-medium">{stats.totalConnections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Latency:</span>
                <span className="font-medium">{stats.avgLatency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Health:</span>
                <Badge 
                  variant={stats.healthPercentage > 80 ? "default" : 
                          stats.healthPercentage > 60 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {stats.healthPercentage}%
                </Badge>
              </div>
            </div>
            
            {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedNodes.length} nodes, {selectedEdges.length} edges
                </div>
              </div>
            )}
          </motion.div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// Wrapper component with provider
export function InteractiveServiceMap() {
  const stats = useMemo(() => {
    const totalServices = mockServices.length;
    const totalConnections = mockDependencies.length;
    const avgLatency = mockDependencies.reduce((sum, dep) => sum + dep.latency, 0) / mockDependencies.length;
    
    return { totalServices, totalConnections, avgLatency: Math.round(avgLatency) };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-2">Service Map</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-3 w-3" />
            <span>{stats.totalServices} Services</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3" />
            <span>{stats.totalConnections} Dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>Avg {stats.avgLatency}ms</span>
          </div>
        </div>
      </motion.div>

      {/* Interactive map */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Service Map
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
        
        <CardContent className="p-0">
          <div className="h-[500px] w-full">
            <ReactFlowProvider>
              <InteractiveServiceMapContent />
            </ReactFlowProvider>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground"
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
    </div>
  );
}