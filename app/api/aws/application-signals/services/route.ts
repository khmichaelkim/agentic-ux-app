import { NextRequest, NextResponse } from 'next/server';
import { ListServicesCommand } from '@aws-sdk/client-application-signals';
import { applicationSignalsClient, validateCredentials } from '@/lib/aws/clients';
import { transformServiceData } from '@/lib/aws/types';

export async function GET(request: NextRequest) {
  try {
    // First, validate that we have AWS credentials
    const hasCredentials = await validateCredentials();
    if (!hasCredentials) {
      return NextResponse.json(
        { 
          error: 'AWS credentials not configured',
          details: 'Please ensure AWS credentials are available (e.g., via ~/.aws/credentials or environment variables)'
        },
        { status: 500 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const maxResults = searchParams.get('maxResults');
    const nextToken = searchParams.get('nextToken');

    // Default to last 24 hours (Application Signals has a 24-hour limit per request)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Create the command
    const command = new ListServicesCommand({
      StartTime: startTime ? new Date(startTime) : yesterday,
      EndTime: endTime ? new Date(endTime) : now,
      MaxResults: maxResults ? parseInt(maxResults) : 100,
      NextToken: nextToken || undefined,
    });

    // Execute the command
    console.log('Calling Application Signals ListServices API...', {
      region: 'us-east-1', // Hardcoded to match our client config
      startTime: command.input.StartTime,
      endTime: command.input.EndTime,
    });
    const response = await applicationSignalsClient.send(command);
    
    // Transform the services to our frontend format
    const transformedServices = (response.ServiceSummaries || [])
      .map(transformServiceData)
      .filter((service): service is NonNullable<typeof service> => service !== null);

    return NextResponse.json({
      services: transformedServices,
      nextToken: response.NextToken,
      rawServices: response.ServiceSummaries, // Include raw data for debugging
      startTime: response.StartTime,
      endTime: response.EndTime,
    });
  } catch (error) {
    console.error('Error fetching Application Signals services:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'CredentialsProviderError') {
        return NextResponse.json(
          { 
            error: 'AWS credentials error',
            details: 'Failed to load AWS credentials. Please run "ada credentials update" or configure AWS credentials.',
            originalError: error.message
          },
          { status: 500 }
        );
      }
      
      if (error.name === 'UnauthorizedException' || error.message?.includes('not authorized')) {
        return NextResponse.json(
          { 
            error: 'Authorization error',
            details: 'Your AWS credentials do not have permission to access Application Signals.',
            originalError: error.message
          },
          { status: 403 }
        );
      }

      if (error.name === 'ResourceNotFoundException') {
        return NextResponse.json(
          { 
            error: 'Service not found',
            details: 'Application Signals may not be enabled in this region or account.',
            originalError: error.message
          },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch services',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}