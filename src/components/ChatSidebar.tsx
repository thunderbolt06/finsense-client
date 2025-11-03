import { useCallback, useEffect, useState } from 'react';
import { fetchChatHistory, getChatPreview, type ChatTrace } from '../api/trace';

interface ChatSidebarProps {
  onSelectChat?: (chatId: string, chatTrace?: ChatTrace) => void;
  onNewChat?: () => void;
  currentChatId?: string | null;
  onTracesLoaded?: (traces: ChatTrace[]) => void;
}

export function ChatSidebar({ onSelectChat, onNewChat, currentChatId, onTracesLoaded }: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatTrace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchChatHistory();
      setChats(response.traces);
      // Notify parent component that traces are loaded
      onTracesLoaded?.(response.traces);
    } catch (err) {
      console.error('Error loading chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, [onTracesLoaded]);

  useEffect(() => {
    loadChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-gray-800">
        <h1 className="text-xl font-semibold text-white mb-1">
          FinSense
        </h1>
        {/* <p className="text-sm text-gray-400 mb-4">
          Your Financial Research Copilot
        </p> */}
        </div>
        <button
          onClick={onNewChat}
          className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-medium text-white">
              New Chat
            </p>
          </div>
        </button>

      <div className="px-4 pt-2">
        <h2 className="text-xs font-thin text-[#f5f5dc]">Recents</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={loadChatHistory}
              className="mt-2 text-xs text-gray-500 hover:text-gray-300 underline"
            >
              Retry
            </button>
          </div>
        ) : chats.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-400 text-sm">No chat history</p>
          </div>
        ) : (
          <div className="py-2">
            {chats.map((chat) => {
              const preview = getChatPreview(chat.chat_history);
              return (
                <button
                  key={chat.chat_id}
                  onClick={() => onSelectChat?.(chat.chat_id, chat)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                    currentChatId === chat.chat_id ? 'bg-gray-800 border-l-2 border-white' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    {/* <p className="text-sm font-medium text-white line-clamp-1">
                      {chat.title || 'Untitled Chat'}
                    </p> */}
                    {preview && (
                        <p className="text-sm font-medium text-white line-clamp-1">
                      {/* <p className="text-xs text-gray-400 line-clamp-2"> */}
                        {preview}
                      </p>
                    )}
                    {/* <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(chat.updated_at)}
                    </p> */}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* <div className="px-4 py-3 border-t border-gray-800">
        <button
          onClick={loadChatHistory}
          className="w-full text-sm text-gray-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div> */}
    </div>
  );
}
