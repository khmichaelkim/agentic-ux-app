interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class AgentCoreAuth {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const response = await fetch('/api/agentcore/auth', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to obtain access token: ${errorText}`);
    }

    const tokenData: TokenResponse = await response.json();
    this.token = tokenData.access_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // Refresh 1 minute early

    return this.token;
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }
}

export const agentCoreAuth = new AgentCoreAuth();