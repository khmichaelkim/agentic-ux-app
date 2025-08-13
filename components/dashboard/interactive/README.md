# Interactive Service Dependency Map

A Google Maps-style interactive visualization for AWS service dependencies built with React Flow.

## Features

### 🗺️ Google Maps-style Navigation
- **Pan & Zoom**: Mouse drag to pan, scroll wheel to zoom
- **Pinch gestures** on touch devices
- **Smooth transitions** and momentum scrolling
- **Fit to view** functionality

### 🎛️ Layout Algorithms
- **Auto Layout** (Dagre): Hierarchical automatic arrangement  
- **Force Directed**: Physics-based node positioning
- **Hierarchical**: Dependency-based layering
- **Grid**: Uniform grid arrangement

### 🎨 Visual Features
- **Drag & drop** service nodes to rearrange
- **Animated connections** with health-based coloring
- **Real-time data updates** with live metrics
- **Status indicators** (healthy/warning/critical)
- **Connection type visualization** (sync/async)

### 📊 Interactive Controls
- **Zoom controls** (+/- buttons)
- **Layout switcher** (top-left panel)
- **Minimap** with overview navigation
- **Live statistics** panel
- **Selection support** (multi-select with Shift)

### 📈 Real-time Features
- **Live metric updates** every 3 seconds
- **Animated error rate changes**
- **Throughput and latency monitoring**
- **Pause/resume** real-time updates

## Components

### ServiceNode
Custom React Flow node component that displays:
- Service name and environment
- Platform type (Lambda/API Gateway)
- Error rate, P99 latency, throughput
- Health status with color coding
- Uptime percentage

### ServiceEdge  
Custom React Flow edge component that displays:
- Connection type (sync/async) with different line styles
- Error rate and latency metrics
- Animated flow particles for sync connections
- Pulse effects for async connections
- Health-based coloring

### InteractiveServiceMap
Main component that orchestrates:
- React Flow provider and state management
- Layout algorithm switching
- Real-time data updates
- Google Maps-style controls
- Statistics and selection tracking

## Usage

```tsx
import { InteractiveServiceMap } from '@/components/dashboard/interactive';

function Dashboard() {
  return (
    <div className="h-screen">
      <InteractiveServiceMap />
    </div>
  );
}
```

## Layout Types

- `dagre`: Automatic hierarchical layout using Dagre algorithm
- `force`: Force-directed physics simulation  
- `hierarchical`: Manual dependency-based layering
- `grid`: Simple grid arrangement
- `manual`: User-positioned nodes

## Data Format

The component expects service data in the format:

```typescript
interface ServiceMetrics {
  id: string;
  name: string;
  environment: string; 
  status: 'healthy' | 'warning' | 'critical';
  errorRate: number;
  latencyP99: number;
  throughput: number;
  uptime: number;
  platform: string;
}

interface ServiceDependency {
  from: string;
  to: string;
  type: 'sync' | 'async';
  errorRate: number;
  latency: number;
}
```

## Keyboard Shortcuts

- **Space + Drag**: Pan the map
- **Scroll**: Zoom in/out
- **Shift + Click**: Multi-select nodes/edges
- **Escape**: Clear selection

## Technical Details

- Built with **React Flow 11.x** for graph visualization
- Uses **Dagre** for automatic layout algorithms
- **Framer Motion** for smooth animations
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Performance

- Optimized for **100+ nodes** with virtualization
- **Real-time updates** without full re-renders
- **Memoized components** for performance
- **Background processing** for layout calculations