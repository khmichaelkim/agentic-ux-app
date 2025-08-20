import { NextRequest } from 'next/server';
import { agentCoreAuth } from '@/lib/agentcore/auth';
import { handleAgentCoreError, logAgentCoreRequest } from '@/lib/agentcore/error-handling';

export async function POST(request: NextRequest) {
  const { message, conversationId, context, actorId, qualifier = 'DEFAULT' } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Development mode - return mock response
        if (process.env.NODE_ENV === 'development' && !process.env.AGENTCORE_AGENT_ARN) {
          const mockResponse = `I'm the AWS Observability Agent running in development mode. 

Based on your request about "${message}", I can help you monitor and analyze your AWS infrastructure. 

Currently, I can see you have ${Math.floor(Math.random() * 10) + 5} services running with the following highlights:
- Average latency: ${(Math.random() * 100 + 50).toFixed(2)}ms
- Error rate: ${(Math.random() * 2).toFixed(2)}%
- Overall health: Good

Would you like me to dive deeper into any specific service or metric?`;

          // Simulate streaming
          const words = mockResponse.split(' ');
          for (const word of words) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'text',
                content: word + ' '
              })}\n\n`)
            );
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'final',
              content: mockResponse
            })}\n\n`)
          );
          
          controller.close();
          return;
        }

        const accessToken = await agentCoreAuth.getAccessToken();
        
        // Build AgentCore Runtime URL (from Lab 5 pattern)
        const region = process.env.AWS_REGION || 'us-east-1';
        const agentArn = process.env.AGENTCORE_AGENT_ARN;
        
        if (!agentArn) {
          throw new Error('AGENTCORE_AGENT_ARN not configured');
        }
        
        const escapedArn = encodeURIComponent(agentArn);
        const url = `https://bedrock-agentcore.${region}.amazonaws.com/runtimes/${escapedArn}/invocations`;
        
        // Build request payload (Lab 5 format)
        const payload = {
          prompt: context || message, // Use context if available
          actor_id: actorId || 'default-user'
        };
        
        // Log request details (with redacted auth)
        logAgentCoreRequest({
          url,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': conversationId,
          },
          payload: { ...payload, prompt: payload.prompt.slice(0, 100) + '...' },
          conversationId
        });
        
        const urlWithQualifier = `${url}?qualifier=${encodeURIComponent(qualifier)}`;
        
        const response = await fetch(urlWithQualifier, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': conversationId, // CRITICAL header
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('AgentCore error:', response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        let accumulatedResponse = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim()) {
                accumulatedResponse += data;
                
                // Check for Lab 5 pattern: JSON between execution markers
                if (accumulatedResponse.includes('"End agent execution"')) {
                  try {
                    // Parse response between markers (Lab 5 pattern)
                    const beginMarker = '"Begin agent execution"';
                    const endMarker = '"End agent execution"';
                    
                    const beginPos = accumulatedResponse.indexOf(beginMarker);
                    const endPos = accumulatedResponse.indexOf(endMarker);
                    
                    if (beginPos !== -1 && endPos !== -1) {
                      const jsonPart = accumulatedResponse.slice(
                        beginPos + beginMarker.length, 
                        endPos
                      ).trim();
                      
                      // Find JSON structure
                      const jsonStart = jsonPart.indexOf('{"role":');
                      if (jsonStart !== -1) {
                        let braceCount = 0;
                        let jsonEnd = -1;
                        
                        for (let i = jsonStart; i < jsonPart.length; i++) {
                          if (jsonPart[i] === '{') braceCount++;
                          else if (jsonPart[i] === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                              jsonEnd = i + 1;
                              break;
                            }
                          }
                        }
                        
                        if (jsonEnd !== -1) {
                          const jsonStr = jsonPart.slice(jsonStart, jsonEnd);
                          const responseData = JSON.parse(jsonStr);
                          
                          if (responseData.content?.[0]?.text) {
                            const formattedText = formatResponseText(responseData.content[0].text);
                            controller.enqueue(
                              encoder.encode(`data: ${JSON.stringify({
                                type: 'final',
                                content: formattedText
                              })}\n\n`)
                            );
                          }
                        }
                      }
                    }
                    break;
                  } catch (e) {
                    console.error('JSON parsing error:', e);
                    // Fall back to raw response
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({
                        type: 'final',
                        content: accumulatedResponse
                      })}\n\n`)
                    );
                  }
                  break; // Exit the loop after processing final response
                } else {
                  // Stream partial response
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'text',
                      content: data
                    })}\n\n`)
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        const agentError = handleAgentCoreError(error);
        console.error('Streaming error:', agentError);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: agentError.message,
            code: agentError.code
          })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Lab 5 response formatting function
function formatResponseText(text: string): string {
  if (!text) return text;
  
  // Remove outer quotes if present
  if (text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1);
  }
  
  // Unescape common escape sequences (Lab 5 pattern)
  text = text.replace(/\\"/g, '"');
  text = text.replace(/\\n/g, '\n');
  text = text.replace(/\\t/g, '\t');
  text = text.replace(/\\r/g, '\r');
  text = text.replace(/\\\\/g, '\\');
  
  return text;
}