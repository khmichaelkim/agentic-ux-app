# AgentCore Gateway Integration

This application includes a complete integration with Amazon Bedrock AgentCore Gateway, providing an AI-powered observability agent chat interface. The implementation follows the official patterns from Amazon's AgentCore E2E tutorials (Lab 5).

## Features

- 🤖 **AI-Powered Chat Interface** - Interactive agent conversation with streaming responses
- 🔐 **Secure Authentication** - OAuth2 client credentials flow via Amazon Cognito
- 💭 **Context Management** - Sliding window conversation history (10 turns)
- ⚡ **Real-time Streaming** - Live response streaming with typing indicators
- 🎯 **Quick Actions** - Pre-defined prompts for common observability queries
- 📊 **Service Integration** - Contextual awareness of your AWS services
- ⏱️ **Performance Metrics** - Response timing for transparency
- 🛡️ **Error Handling** - Graceful error recovery with user-friendly messages

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Cognito Configuration
COGNITO_DOMAIN=https://your-domain.auth.region.amazoncognito.com
AGENTCORE_CLIENT_ID=your-client-id
AGENTCORE_CLIENT_SECRET=your-client-secret

# AgentCore Agent ARN
AGENTCORE_AGENT_ARN=arn:aws:bedrock-agentcore:region:account-id:agent/agent-id

# AWS Region
AWS_REGION=us-east-1
```

### 2. Cognito Setup

Your Cognito User Pool needs:
- An app client with client credentials grant enabled
- The `agentcore/invoke_agent` scope configured
- Client ID and secret for authentication

### 3. AgentCore Runtime

Ensure your AgentCore agent is deployed and the ARN is accessible.

## Architecture

### Component Flow

```
User → Next.js Frontend → API Routes → AgentCore Runtime
         ↓                    ↓              ↓
    Chat Interface      Auth Service    Agent Processing
         ↓                    ↓              ↓
    Context Panel       Token Mgmt      Tool Execution
```

### Key Components

- **`/app/agent/page.tsx`** - Main chat interface page
- **`/components/agent/*`** - Chat UI components
- **`/lib/hooks/use-agent-chat.ts`** - Chat state management hook
- **`/lib/agentcore/auth.ts`** - OAuth2 token management
- **`/app/api/agentcore/auth/route.ts`** - Authentication endpoint
- **`/app/api/agentcore/chat/route.ts`** - Streaming chat endpoint

## Development Mode

The application includes a development mode with mock responses when AgentCore credentials are not configured. This allows you to:
- Test the UI without AgentCore setup
- Develop frontend features independently
- Demo the interface

## Production Deployment

### Security Considerations

1. **Token Management** - Tokens are refreshed 1 minute before expiry
2. **Session Isolation** - Each conversation has a unique session ID
3. **Error Handling** - Sensitive information is never exposed to users
4. **Request Logging** - Authorization headers are redacted in logs

### Performance Optimization

- **Streaming Responses** - Better perceived performance
- **Context Window** - Limited to 10 turns to manage token usage
- **Client-side Caching** - Token caching reduces auth calls

## API Reference

### POST `/api/agentcore/chat`

Stream a conversation with the agent.

**Request Body:**
```json
{
  "message": "User's message",
  "conversationId": "unique-session-id",
  "context": "Full conversation context",
  "actorId": "user-identifier",
  "qualifier": "DEFAULT"
}
```

**Response:** Server-Sent Events stream
```
data: {"type": "text", "content": "Partial response..."}
data: {"type": "final", "content": "Complete response"}
data: {"type": "error", "error": "Error message", "code": "ERROR_CODE"}
```

### POST `/api/agentcore/auth`

Obtain OAuth2 access token.

**Response:**
```json
{
  "access_token": "token",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized** - Check Cognito credentials and token expiry
2. **404 Not Found** - Verify AgentCore ARN and URL encoding
3. **403 Forbidden** - Ensure proper IAM permissions and scope
4. **Timeout** - Check agent response time and network connectivity

### Debug Mode

Enable debug logging by setting:
```javascript
console.log(process.env.NODE_ENV); // Should show 'development'
```

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
1. Navigate to `/agent`
2. Click a quick action or type a message
3. Verify streaming response appears
4. Check console for any errors

### End-to-End Tests
1. Configure real AgentCore credentials
2. Test authentication flow
3. Verify agent responses match expected behavior
4. Test error scenarios

## Lab 5 Compatibility

This implementation follows the patterns from Amazon Bedrock AgentCore E2E Workshop Lab 5:
- ✅ URL encoding for agent ARN
- ✅ Session ID header inclusion
- ✅ Context window management
- ✅ Response parsing with execution markers
- ✅ Bearer token authentication
- ✅ Qualifier parameter support
- ✅ Streaming response handling

## Next Steps

1. **Custom Tools** - Add domain-specific tools to your agent
2. **Memory Persistence** - Implement cross-session memory
3. **Analytics** - Add conversation analytics and metrics
4. **Multi-agent** - Support multiple specialized agents
5. **Mobile Optimization** - Enhance mobile responsiveness

## Support

For issues or questions:
- Check the [AgentCore documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agentcore.html)
- Review the [Lab 5 tutorial](../amazon-bedrock-agentcore-samples/01-tutorials/07-AgentCore-E2E/lab-05-frontend.ipynb)
- Open an issue in this repository