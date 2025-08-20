import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cognitoDomain = process.env.COGNITO_DOMAIN;
    const clientId = process.env.AGENTCORE_CLIENT_ID;
    const clientSecret = process.env.AGENTCORE_CLIENT_SECRET;

    if (!cognitoDomain || !clientId || !clientSecret) {
      console.error('Missing Cognito configuration:', {
        hasDomain: !!cognitoDomain,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      });
      
      // Return mock token for development
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          access_token: 'mock-development-token',
          token_type: 'Bearer',
          expires_in: 3600
        });
      }
      
      throw new Error('Missing required Cognito configuration');
    }

    const tokenResponse = await fetch(`${cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'agentcore/invoke_agent'
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Token request failed:', tokenResponse.status, errorBody);
      throw new Error(`Failed to obtain access token: ${errorBody}`);
    }

    const tokenData = await tokenResponse.json();
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        isDevelopment: process.env.NODE_ENV === 'development'
      },
      { status: 500 }
    );
  }
}