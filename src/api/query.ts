import { API_CONFIG } from '../config/api';

export interface QueryRequest {
  question: string;
  chat_id: string | null;
}

export interface StreamToken {
  text: string;
  event: 'token';
}

export interface StreamThought {
  content: string;
  event: 'thought';
}

export interface StreamToolResult {
  event: 'tool_result';
  content: string;
}

export interface StreamDone {
  event: 'done';
  chat_id: string;
}

export type StreamEvent = StreamToken | StreamThought | StreamToolResult | StreamDone;

export interface StreamCallbacks {
  onToken?: (text: string) => void;
  onThought?: (content: string) => void;
  onToolResult?: (content: string) => void;
}

/**
 * Sends a query to the FinSense API with streaming support
 * 
 * Parses SSE stream responses and handles:
 * - 'token' events: regular message tokens
 * - 'thought' events: thought content (shown in expandable section)
 * - 'tool_result' events: tool results (e.g., web search queries)
 * - 'done' event: completion with chat_id
 * 
 * Returns the chat_id from the done event
 */
export async function sendQuery(
  question: string,
  chatId: string | null,
  callbacks?: StreamCallbacks,
): Promise<string> {
  const response = await fetch(API_CONFIG.QUERY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      chat_id: chatId,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalChatId = chatId || '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim() === '') continue;
      
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.slice(6).trim();
          const data: StreamEvent = JSON.parse(jsonStr);
          
          if (data.event === 'token' && 'text' in data) {
            callbacks?.onToken?.(data.text);
          } else if (data.event === 'thought' && 'content' in data) {
            callbacks?.onThought?.(data.content);
          } else if (data.event === 'tool_result' && 'content' in data) {
            callbacks?.onToolResult?.(data.content);
          } else if (data.event === 'done' && 'chat_id' in data) {
            finalChatId = data.chat_id;
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e, line);
        }
      }
    }
  }

  return finalChatId;
}