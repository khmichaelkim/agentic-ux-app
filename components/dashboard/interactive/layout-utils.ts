import { Node, Edge, Position } from "reactflow";
import dagre from "dagre";
import { ServiceMetrics, ServiceDependency } from "@/lib/mock-data/services";
import { ServiceNodeData } from "./service-node";
import { ServiceEdgeData } from "./service-edge";

export type ServiceNode = Node<ServiceNodeData>;
export type ServiceEdge = Edge<ServiceEdgeData>;

// Constants for layout
const NODE_WIDTH = 180;
const NODE_HEIGHT = 160;
const LAYOUT_DIRECTION = 'TB'; // Top to Bottom

/**
 * Convert service data to React Flow format
 */
export function convertToReactFlow(
  services: ServiceMetrics[], 
  dependencies: ServiceDependency[]
): { nodes: ServiceNode[], edges: ServiceEdge[] } {
  // Create nodes
  const nodes: ServiceNode[] = services.map((service, index) => ({
    id: service.id,
    type: 'serviceNode',
    position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
    data: service,
  }));

  // Create edges
  const edges: ServiceEdge[] = dependencies.map((dep, index) => ({
    id: `e-${dep.from}-${dep.to}`,
    source: dep.from,
    target: dep.to,
    type: 'serviceEdge',
    data: dep,
  }));

  return { nodes, edges };
}

/**
 * Apply Dagre auto-layout algorithm
 */
export function getAutoLayoutedElements(
  nodes: ServiceNode[], 
  edges: ServiceEdge[],
  direction = LAYOUT_DIRECTION
): { nodes: ServiceNode[], edges: ServiceEdge[] } {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: NODE_WIDTH, 
      height: NODE_HEIGHT 
    });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  const layoutedNodes: ServiceNode[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };

    return newNode;
  });

  return { 
    nodes: layoutedNodes, 
    edges 
  };
}

/**
 * Apply force-directed layout (simulated)
 */
export function getForceLayoutedElements(
  nodes: ServiceNode[], 
  edges: ServiceEdge[],
  width = 800,
  height = 600
): { nodes: ServiceNode[], edges: ServiceEdge[] } {
  // Simple force-directed simulation
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;

  const layoutedNodes = nodes.map((node, index) => {
    // Arrange in a circle initially
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = centerX + Math.cos(angle) * radius - NODE_WIDTH / 2;
    const y = centerY + Math.sin(angle) * radius - NODE_HEIGHT / 2;

    return {
      ...node,
      position: { x, y },
    };
  });

  return { 
    nodes: layoutedNodes, 
    edges 
  };
}

/**
 * Apply hierarchical layout based on service dependencies
 */
export function getHierarchicalLayout(
  nodes: ServiceNode[], 
  edges: ServiceEdge[],
  width = 800,
  height = 600
): { nodes: ServiceNode[], edges: ServiceEdge[] } {
  // Build dependency graph
  const incomingCount = new Map<string, number>();
  const outgoingNodes = new Map<string, string[]>();

  // Initialize counts
  nodes.forEach(node => {
    incomingCount.set(node.id, 0);
    outgoingNodes.set(node.id, []);
  });

  // Count incoming edges and build outgoing lists
  edges.forEach(edge => {
    const currentCount = incomingCount.get(edge.target) || 0;
    incomingCount.set(edge.target, currentCount + 1);
    
    const outgoing = outgoingNodes.get(edge.source) || [];
    outgoing.push(edge.target);
    outgoingNodes.set(edge.source, outgoing);
  });

  // Topological sort to determine layers
  const layers: string[][] = [];
  const queue = nodes.filter(node => (incomingCount.get(node.id) || 0) === 0);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentLayer = [...queue];
    layers.push(currentLayer.map(node => node.id));
    
    queue.length = 0; // Clear queue
    
    currentLayer.forEach(node => {
      visited.add(node.id);
      const targets = outgoingNodes.get(node.id) || [];
      
      targets.forEach(targetId => {
        const newCount = (incomingCount.get(targetId) || 0) - 1;
        incomingCount.set(targetId, newCount);
        
        if (newCount === 0 && !visited.has(targetId)) {
          const targetNode = nodes.find(n => n.id === targetId);
          if (targetNode) queue.push(targetNode);
        }
      });
    });
  }

  // Position nodes in layers
  const layerHeight = height / Math.max(layers.length, 1);
  
  const layoutedNodes = nodes.map(node => {
    const layerIndex = layers.findIndex(layer => layer.includes(node.id));
    const positionInLayer = layers[layerIndex]?.indexOf(node.id) || 0;
    const layerSize = layers[layerIndex]?.length || 1;
    
    const x = (width / (layerSize + 1)) * (positionInLayer + 1) - NODE_WIDTH / 2;
    const y = layerHeight * (layerIndex + 0.5) - NODE_HEIGHT / 2;

    return {
      ...node,
      position: { x, y },
    };
  });

  return { 
    nodes: layoutedNodes, 
    edges 
  };
}

/**
 * Apply manual grid layout
 */
export function getGridLayout(
  nodes: ServiceNode[], 
  edges: ServiceEdge[],
  width = 800,
  height = 600
): { nodes: ServiceNode[], edges: ServiceEdge[] } {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const rows = Math.ceil(nodes.length / cols);
  
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const layoutedNodes = nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = col * cellWidth + cellWidth / 2 - NODE_WIDTH / 2;
    const y = row * cellHeight + cellHeight / 2 - NODE_HEIGHT / 2;

    return {
      ...node,
      position: { x, y },
    };
  });

  return { 
    nodes: layoutedNodes, 
    edges 
  };
}

/**
 * Layout presets
 */
export type LayoutType = 'dagre' | 'force' | 'hierarchical' | 'grid' | 'manual';

export function applyLayout(
  nodes: ServiceNode[], 
  edges: ServiceEdge[],
  layoutType: LayoutType = 'dagre',
  containerWidth = 800,
  containerHeight = 600
): { nodes: ServiceNode[], edges: ServiceEdge[] } {
  switch (layoutType) {
    case 'dagre':
      return getAutoLayoutedElements(nodes, edges);
    case 'force':
      return getForceLayoutedElements(nodes, edges, containerWidth, containerHeight);
    case 'hierarchical':
      return getHierarchicalLayout(nodes, edges, containerWidth, containerHeight);
    case 'grid':
      return getGridLayout(nodes, edges, containerWidth, containerHeight);
    case 'manual':
    default:
      return { nodes, edges };
  }
}