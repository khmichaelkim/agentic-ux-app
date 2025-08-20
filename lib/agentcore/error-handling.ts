export class AgentCoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentCoreError';
  }
}

export function handleAgentCoreError(error: unknown): AgentCoreError {
  if (error instanceof AgentCoreError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Handle specific AgentCore error patterns
    if (error.message.includes('Bearer token') || error.message.includes('401')) {
      return new AgentCoreError('Authentication failed - please refresh and try again', 'AUTH_ERROR', 401);
    }
    if (error.message.includes('AgentCore-Runtime-Session-Id')) {
      return new AgentCoreError('Invalid session', 'SESSION_ERROR', 400);
    }
    if (error.message.includes('escaped_arn') || error.message.includes('404')) {
      return new AgentCoreError('Agent not found - check configuration', 'CONFIG_ERROR', 404);
    }
    if (error.message.includes('403')) {
      return new AgentCoreError('Access denied - check permissions', 'PERMISSION_ERROR', 403);
    }
    if (error.message.includes('timeout')) {
      return new AgentCoreError('Request timed out - please try again', 'TIMEOUT_ERROR', 408);
    }
  }
  
  return new AgentCoreError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}

export function logAgentCoreRequest(requestDetails: {
  url: string;
  headers: Record<string, string>;
  payload: any;
  conversationId: string;
}) {
  console.log('AgentCore Request:', {
    ...requestDetails,
    headers: {
      ...requestDetails.headers,
      Authorization: requestDetails.headers.Authorization ? '[REDACTED]' : undefined
    }
  });
}