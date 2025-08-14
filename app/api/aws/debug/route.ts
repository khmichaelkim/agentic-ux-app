import { NextResponse } from 'next/server';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

export async function GET() {
  try {
    const credentials = defaultProvider({
      profile: 'default',
    });
    
    const stsClient = new STSClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials,
    });
    
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);
    
    return NextResponse.json({
      success: true,
      identity: {
        userId: response.UserId,
        account: response.Account,
        arn: response.Arn,
      },
      environment: {
        AWS_PROFILE: process.env.AWS_PROFILE,
        AWS_REGION: process.env.AWS_REGION,
        NODE_ENV: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}