export interface ServiceMetrics {
  id: string;
  name: string;
  environment: string;
  status: 'healthy' | 'warning' | 'critical';
  errorRate: number;
  latencyP99: number;
  throughput: number;
  uptime: number;
  platform: string;
  lastUpdate: Date;
}

export interface SLOStatus {
  id: string;
  name: string;
  service: string;
  type: 'availability' | 'latency';
  target: number;
  current: number;
  status: 'meeting' | 'at_risk' | 'breaching';
  remainingBudget: number;
  lastBreach: Date | null;
}

export interface ServiceDependency {
  from: string;
  to: string;
  type: 'sync' | 'async';
  errorRate: number;
  latency: number;
}

// Mock services based on real Application Signals data
export const mockServices: ServiceMetrics[] = [
  {
    id: 'transaction-service',
    name: 'Transaction Service',
    environment: 'lambda:default',
    status: 'warning',
    errorRate: 2.3,
    latencyP99: 1250,
    throughput: 1432,
    uptime: 99.2,
    platform: 'AWS Lambda',
    lastUpdate: new Date(Date.now() - 30000)
  },
  {
    id: 'fraud-detection-service',
    name: 'Fraud Detection Service',
    environment: 'lambda:default', 
    status: 'healthy',
    errorRate: 0.1,
    latencyP99: 850,
    throughput: 1432,
    uptime: 99.9,
    platform: 'AWS Lambda',
    lastUpdate: new Date(Date.now() - 15000)
  },
  {
    id: 'rewards-eligibility-service',
    name: 'Rewards Service', 
    environment: 'lambda:default',
    status: 'healthy',
    errorRate: 0.05,
    latencyP99: 420,
    throughput: 856,
    uptime: 99.95,
    platform: 'AWS Lambda',
    lastUpdate: new Date(Date.now() - 45000)
  },
  {
    id: 'transaction-processing-api',
    name: 'Transaction API',
    environment: 'api-gateway:prod',
    status: 'critical', 
    errorRate: 8.7,
    latencyP99: 3200,
    throughput: 2104,
    uptime: 95.2,
    platform: 'API Gateway',
    lastUpdate: new Date(Date.now() - 10000)
  },
  {
    id: 'transaction-data-generator',
    name: 'Data Generator',
    environment: 'lambda:default',
    status: 'healthy',
    errorRate: 0.02,
    latencyP99: 125,
    throughput: 45,
    uptime: 99.98,
    platform: 'AWS Lambda', 
    lastUpdate: new Date(Date.now() - 60000)
  }
];

// Mock SLOs based on real Application Signals SLOs
export const mockSLOs: SLOStatus[] = [
  {
    id: 'api-gateway-availability',
    name: 'API Gateway Availability',
    service: 'Transaction API',
    type: 'availability',
    target: 99.9,
    current: 95.2,
    status: 'breaching',
    remainingBudget: 0,
    lastBreach: new Date(Date.now() - 120000)
  },
  {
    id: 'api-gateway-latency',
    name: 'API Gateway Latency',
    service: 'Transaction API', 
    type: 'latency',
    target: 1000,
    current: 3200,
    status: 'breaching',
    remainingBudget: 0,
    lastBreach: new Date(Date.now() - 300000)
  },
  {
    id: 'transaction-service-availability',
    name: 'Transaction Service Availability',
    service: 'Transaction Service',
    type: 'availability', 
    target: 99.5,
    current: 99.2,
    status: 'at_risk',
    remainingBudget: 15,
    lastBreach: null
  },
  {
    id: 'fraud-detection-latency',
    name: 'Fraud Detection Latency',
    service: 'Fraud Detection Service',
    type: 'latency',
    target: 1500,
    current: 850,
    status: 'meeting',
    remainingBudget: 85,
    lastBreach: null
  },
  {
    id: 'rewards-service-availability',
    name: 'Rewards Service Availability',
    service: 'Rewards Service',
    type: 'availability',
    target: 99.9,
    current: 99.95,
    status: 'meeting',
    remainingBudget: 92,
    lastBreach: null
  },
  {
    id: 'rewards-service-latency', 
    name: 'Rewards Service Latency',
    service: 'Rewards Service',
    type: 'latency',
    target: 500,
    current: 420,
    status: 'meeting',
    remainingBudget: 78,
    lastBreach: null
  },
  {
    id: 'data-generator-availability',
    name: 'Data Generator Availability', 
    service: 'Data Generator',
    type: 'availability',
    target: 99.0,
    current: 99.98,
    status: 'meeting',
    remainingBudget: 95,
    lastBreach: null
  },
  {
    id: 'transaction-service-latency',
    name: 'Transaction Service Latency',
    service: 'Transaction Service',
    type: 'latency',
    target: 800,
    current: 1250,
    status: 'at_risk',
    remainingBudget: 35,
    lastBreach: null
  }
];

// Mock service dependencies based on real service map
export const mockDependencies: ServiceDependency[] = [
  {
    from: 'transaction-processing-api',
    to: 'transaction-service',
    type: 'sync',
    errorRate: 5.2,
    latency: 1200
  },
  {
    from: 'transaction-service',
    to: 'fraud-detection-service',
    type: 'sync', 
    errorRate: 1.8,
    latency: 450
  },
  {
    from: 'transaction-service',
    to: 'rewards-eligibility-service',
    type: 'sync',
    errorRate: 0.3,
    latency: 200
  },
  {
    from: 'transaction-data-generator',
    to: 'transaction-processing-api',
    type: 'async',
    errorRate: 0.1,
    latency: 80
  }
];

// Mock time series data for charts
export interface MetricDataPoint {
  timestamp: Date;
  value: number;
}

export const generateMockTimeSeries = (
  hours: number = 24,
  baseValue: number = 100,
  variance: number = 20
): MetricDataPoint[] => {
  const points: MetricDataPoint[] = [];
  const now = new Date();
  
  for (let i = hours * 60; i >= 0; i -= 5) { // 5 minute intervals
    const timestamp = new Date(now.getTime() - i * 60 * 1000);
    const noise = (Math.random() - 0.5) * variance;
    const trend = Math.sin((i / 60) * Math.PI / 12) * (variance / 2); // Daily pattern
    const value = Math.max(0, baseValue + noise + trend);
    points.push({ timestamp, value });
  }
  
  return points;
};

// Mock alerts and incidents
export interface Alert {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  description: string;
  timestamp: Date;
  status: 'firing' | 'resolved';
}

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    title: 'High Error Rate Detected',
    severity: 'critical',
    service: 'Transaction API',
    description: 'Error rate has exceeded 5% threshold for the last 10 minutes',
    timestamp: new Date(Date.now() - 600000),
    status: 'firing'
  },
  {
    id: 'alert-2', 
    title: 'Latency SLO Breach',
    severity: 'high',
    service: 'Transaction API',
    description: 'P99 latency exceeds 1000ms SLO target',
    timestamp: new Date(Date.now() - 900000), 
    status: 'firing'
  },
  {
    id: 'alert-3',
    title: 'Memory Usage Warning',
    severity: 'medium',
    service: 'Transaction Service',
    description: 'Memory usage at 85% of allocated limit',
    timestamp: new Date(Date.now() - 1800000),
    status: 'resolved'
  }
];