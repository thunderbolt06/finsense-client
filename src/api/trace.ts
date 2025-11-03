import { API_CONFIG } from '../config/api';
import type { MessageData } from '../components/Message';

export interface ChatTrace {
  chat_id: string;
  title: string;
  finished: boolean;
  created_at: string;
  updated_at: string;
  chat_history: Array<[string, string]>;
}

export interface TracesResponse {
  status: string;
  count: number;
  traces: ChatTrace[];
}

/**
 * Fetches chat history from the GET /api/traces endpoint
 */
export async function fetchChatHistory(): Promise<TracesResponse> {
  const response = await fetch(API_CONFIG.TRACES_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Extracts preview text from chat history
 */
export function getChatPreview(chatHistory: Array<[string, string]>): string {
  // Find the first user message
  const userMessage = chatHistory.find(([role]) => role === 'user');
  if (userMessage) {
    const content = userMessage[1];
    // Extract text from "text:..." format
    if (content.startsWith('text:')) {
      return content.slice(5);
    }
    return content;
  }
  return '';
}

/**
 * Converts chat history from API format to MessageData format
 * Handles thoughts and web search queries from the history
 */
export function parseChatHistory(
  chatHistory: Array<[string, string]>,
  chatId: string
): MessageData[] {
  const messages: MessageData[] = [];
  let assistantMessageId: string | null = null;
  let assistantContent = '';
  let assistantThought = '';
  let assistantWebSearchQueries: string[] = [];
  let messageIndex = 0;

  for (const [role, content] of chatHistory) {
    if (role === 'user') {
      // Save previous assistant message if exists
      if (assistantMessageId && (assistantContent || assistantThought || assistantWebSearchQueries.length > 0)) {
        messages.push({
          id: assistantMessageId,
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          thought: assistantThought || undefined,
          webSearchQueries: assistantWebSearchQueries.length > 0 ? assistantWebSearchQueries : undefined,
        });
        assistantContent = '';
        assistantThought = '';
        assistantWebSearchQueries = [];
      }

      // Parse user message
      const userContent = content.startsWith('text:')
        ? content.slice(5)
        : content;

      if (userContent.trim()) {
        messages.push({
          id: `user-${chatId}-${messageIndex}`,
          role: 'user',
          content: userContent,
          timestamp: new Date(),
        });
        messageIndex++;
      }
    } else if (role === 'assistant') {
      if (!assistantMessageId) {
        assistantMessageId = `assistant-${chatId}-${messageIndex}`;
      }

      if (content.startsWith('text:')) {
        assistantContent += content.slice(5);
      } else if (content.startsWith('thought:')) {
        assistantThought += content.slice(8);
      } else {
        assistantContent += content;
      }
    } else if (role === 'tool') {
      // Parse tool_result format
      if (content.startsWith('tool_result:')) {
        try {
          const toolResultStr = content.slice(12);
          const toolResult = JSON.parse(toolResultStr);

          // Extract web search queries from tool results
          if (toolResult.modality?.type === 'chat_with_web_search' ||
              toolResult.modality?.type === 'chat_with_web_search_multi') {
            const queries = toolResult.modality.search_query
              ? [toolResult.modality.search_query]
              : toolResult.modality.search_queries || [];

            assistantWebSearchQueries.push(...queries);
          }
        } catch (e) {
          console.error('Error parsing tool_result in chat history:', e);
        }
      }
    }
  }

  // Save last assistant message if exists
  if (assistantMessageId && (assistantContent || assistantThought || assistantWebSearchQueries.length > 0)) {
    messages.push({
      id: assistantMessageId,
      role: 'assistant',
      content: assistantContent,
      timestamp: new Date(),
      thought: assistantThought || undefined,
      webSearchQueries: assistantWebSearchQueries.length > 0 ? assistantWebSearchQueries : undefined,
    });
  }

  return messages;
}