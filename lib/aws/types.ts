// Types for Application Signals API responses

export interface ServiceSummary {
  KeyAttributes?: {
    Type?: string;
    Name?: string;
    Environment?: string;
  };
  MetricReferences?: Array<{
    Namespace?: string;
    MetricName?: string;
    MetricType?: string;
    Dimensions?: Array<{
      Name?: string;
      Value?: string;
    }>;
  }>;
  AttributeMaps?: Array<Record<string, string>>;
  ServiceGroups?: string[];
}

export interface ListServicesResponse {
  ServiceSummaries?: ServiceSummary[];
  StartTime?: string;
  EndTime?: string;
  NextToken?: string;
}

export interface ServiceMetrics {
  id: string;
  name: string;
  environment: string;
  platform: string;
  status: 'healthy' | 'warning' | 'critical';
  errorRate: number;
  latencyP99: number;
  throughput: number;
  uptime: number;
  lastUpdate: Date;
}

// Helper to transform AWS service data to our frontend format
export function transformServiceData(service: ServiceSummary): ServiceMetrics | null {
  const name = service.KeyAttributes?.Name;
  const environment = service.KeyAttributes?.Environment || 'unknown';
  
  if (!name) return null;
  
  // Extract platform from AttributeMaps
  let platform = 'AWS';
  if (service.AttributeMaps) {
    for (const attrMap of service.AttributeMaps) {
      if (attrMap.PlatformType) {
        platform = attrMap.PlatformType.replace('AWS::', '');
        break;
      }
      // Also check for Lambda function name
      if (attrMap['Lambda.Function.Name']) {
        platform = 'Lambda';
      }
    }
  }
  
  // Fallback platform detection from environment
  if (platform === 'AWS' || platform === 'Generic') {
    platform = detectPlatformFromEnvironment(environment);
  }
  
  // Extract metric types available for this service
  const hasLatencyMetric = service.MetricReferences?.some(m => m.MetricType === 'LATENCY');
  const hasErrorMetric = service.MetricReferences?.some(m => m.MetricType === 'ERROR');
  const hasFaultMetric = service.MetricReferences?.some(m => m.MetricType === 'FAULT');
  
  // For now, we'll generate placeholder metrics
  // In a real implementation, you'd fetch actual metrics from CloudWatch
  return {
    id: `${name}-${environment}`.replace(/[^a-zA-Z0-9-]/g, '_'),
    name,
    environment,
    platform,
    status: 'healthy', // Would be determined by actual metrics
    errorRate: hasErrorMetric ? Math.random() * 2 : 0,
    latencyP99: hasLatencyMetric ? Math.floor(Math.random() * 500) + 100 : 0,
    throughput: Math.floor(Math.random() * 1000) + 100,
    uptime: 99.5 + Math.random() * 0.5,
    lastUpdate: new Date(),
  };
}

function detectPlatformFromEnvironment(environment: string): string {
  const envLower = environment.toLowerCase();
  if (envLower.includes('lambda')) return 'Lambda';
  if (envLower.includes('ecs')) return 'ECS';
  if (envLower.includes('ec2')) return 'EC2';
  if (envLower.includes('eks')) return 'EKS';
  if (envLower.includes('api-gateway')) return 'API Gateway';
  if (envLower.includes('fargate')) return 'Fargate';
  return 'AWS';
}