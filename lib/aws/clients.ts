import { ApplicationSignalsClient } from "@aws-sdk/client-application-signals";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

const getCredentials = () => {
  // Use the default credential provider chain
  // This automatically checks in order:
  // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  // 2. Shared credentials file (~/.aws/credentials) with specified profile
  // 3. ECS task credentials
  // 4. EC2 instance credentials
  
  // IMPORTANT: Always use 'default' profile to match AWS CLI behavior
  // This ensures we use the same credentials as `aws ... --profile default`
  return defaultProvider({
    profile: 'default', // Explicitly use 'default' profile
  });
};

// Force us-east-1 for Application Signals (where the data is)
const config = {
  region: 'us-east-1', // Application Signals data is in us-east-1
  credentials: getCredentials(),
};

// Create singleton instances
export const applicationSignalsClient = new ApplicationSignalsClient(config);

// Helper to check if credentials are available
export async function validateCredentials(): Promise<boolean> {
  try {
    const credentials = await config.credentials();
    return !!(credentials.accessKeyId && credentials.secretAccessKey);
  } catch (error) {
    console.error('Failed to load AWS credentials:', error);
    return false;
  }
}