import { useState, useEffect, useCallback } from 'react';
import { ServiceMetrics } from '@/lib/aws/types';

interface UseAwsServicesOptions {
  autoFetch?: boolean;
  fallbackToMock?: boolean;
  pollingInterval?: number; // in milliseconds
}

interface UseAwsServicesResult {
  services: ServiceMetrics[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isUsingMockData: boolean;
}

export function useAwsServices(options: UseAwsServicesOptions = {}): UseAwsServicesResult {
  const { 
    autoFetch = true, 
    fallbackToMock = true,
    pollingInterval = 0 // 0 means no polling
  } = options;
  
  const [services, setServices] = useState<ServiceMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/aws/application-signals/services');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch services');
      }
      
      const data = await response.json();
      
      if (data.services && data.services.length > 0) {
        setServices(data.services);
        setIsUsingMockData(false);
      } else if (fallbackToMock) {
        // If no services returned and fallback is enabled, use mock data
        console.warn('No services returned from AWS, falling back to mock data');
        const { mockServices } = await import('@/lib/mock-data/services');
        setServices(mockServices);
        setIsUsingMockData(true);
      } else {
        setServices([]);
        setIsUsingMockData(false);
      }
    } catch (err) {
      console.error('Error fetching AWS services:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      // Fallback to mock data if enabled
      if (fallbackToMock) {
        console.warn('Failed to fetch AWS services, using mock data as fallback');
        const { mockServices } = await import('@/lib/mock-data/services');
        setServices(mockServices);
        setIsUsingMockData(true);
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackToMock]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchServices();
    }
  }, [autoFetch, fetchServices]);

  // Set up polling if interval is specified
  useEffect(() => {
    if (pollingInterval > 0) {
      const interval = setInterval(fetchServices, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [pollingInterval, fetchServices]);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    isUsingMockData,
  };
}

// Hook for fetching a single service with more details
export function useAwsService(serviceName: string | undefined) {
  const [service, setService] = useState<ServiceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!serviceName) {
      setService(null);
      return;
    }

    const fetchService = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For now, we'll fetch all services and find the one we want
        // In a real implementation, you'd have a dedicated endpoint
        const response = await fetch('/api/aws/application-signals/services');
        
        if (!response.ok) {
          throw new Error('Failed to fetch service');
        }
        
        const data = await response.json();
        const foundService = data.services?.find(
          (s: ServiceMetrics) => s.name === serviceName
        );
        
        if (foundService) {
          setService(foundService);
        } else {
          // Fallback to mock data
          const { mockServices } = await import('@/lib/mock-data/services');
          const mockService = mockServices.find(s => s.name === serviceName);
          setService(mockService || null);
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Fallback to mock data
        const { mockServices } = await import('@/lib/mock-data/services');
        const mockService = mockServices.find(s => s.name === serviceName);
        setService(mockService || null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceName]);

  return { service, loading, error };
}