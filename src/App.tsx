import { useCallback, useRef, useState } from 'react';
import { ChatComposer, type ChatComposerRef } from './components/ChatComposer';
import { MessageList } from './components/MessageList';
import { ChatSidebar } from './components/ChatSidebar';
import type { MessageData } from './components/Message';
import { sendQuery } from './api/query';
import { parseChatHistory } from './api/trace';
import type { ChatTrace } from './api/trace';

function App() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatTraces, setChatTraces] = useState<Map<string, ChatTrace>>(new Map());
  const composerRef = useRef<ChatComposerRef>(null);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    // Focus the composer after switching to new chat
    setTimeout(() => {
      composerRef.current?.focus();
    }, 0);
  };

  const handleSelectChat = (chatId: string, chatTrace?: ChatTrace) => {
    setCurrentChatId(chatId);
    
    // If we have the chat trace, load its history
    if (chatTrace && chatTrace.chat_history) {
      const parsedMessages = parseChatHistory(chatTrace.chat_history, chatId);
      setMessages(parsedMessages);
    } else {
      // If trace not provided, try to find it in stored traces
      const trace = chatTraces.get(chatId);
      if (trace && trace.chat_history) {
        const parsedMessages = parseChatHistory(trace.chat_history, chatId);
        setMessages(parsedMessages);
      } else {
        // No history found, clear messages
        setMessages([]);
      }
    }
    // Focus the composer after switching chats
    setTimeout(() => {
      composerRef.current?.focus();
    }, 0);
  };

  const handleTracesLoaded = useCallback((traces: ChatTrace[]) => {
    // Store all traces in a Map for quick lookup
    const tracesMap = new Map<string, ChatTrace>();
    traces.forEach((trace) => {
      tracesMap.set(trace.chat_id, trace);
    });
    setChatTraces(tracesMap);
  }, []);

  const handleSend = async (content: string) => {
    // Add user message immediately
    const userMessage: MessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Create assistant message placeholder for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: MessageData = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(true);

    try {
      // Stream the response and update the assistant message in real-time
      const newChatId = await sendQuery(
        content,
        currentChatId,
        {
          onToken: (text: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + text }
                  : msg
              )
            );
          },
          onThought: (content: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, thought: (msg.thought || '') + content }
                  : msg
              )
            );
          },
          onToolResult: (content: string) => {
            try {
              const toolResult = JSON.parse(content);
              // Extract web search queries from tool results
              if (toolResult.modality?.type === 'chat_with_web_search' ||
                  toolResult.modality?.type === 'chat_with_web_search_multi') {
                const queries = toolResult.modality.search_query
                  ? [toolResult.modality.search_query]
                  : toolResult.modality.search_queries || [];
                
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          webSearchQueries: [...(msg.webSearchQueries || []), ...queries],
                        }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing tool_result:', e);
            }
          },
        }
      );

      // Update chat_id if we got a new one
      if (newChatId && newChatId !== currentChatId) {
        setCurrentChatId(newChatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar 
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
        onTracesLoaded={handleTracesLoaded}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages - overflow at full width so scrollbar is at edge */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-center min-h-full">
            <div className="w-full max-w-screen-md flex flex-col">
              <MessageList messages={messages} />
            </div>
          </div>
        </div>

        {/* Composer - full width container */}
        <div className="bg-black p-4 flex-shrink-0">
          <div className="flex justify-center">
            <div className="w-full max-w-screen-md">
              <ChatComposer ref={composerRef} onSend={handleSend} disabled={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;