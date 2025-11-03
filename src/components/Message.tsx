import ReactMarkdown from 'react-markdown';
import { Thought } from './Thought';
import { WebSearchModality } from './WebSearchModality';

export interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thought?: string; // Accumulated thought content from 'thought' events
  webSearchQueries?: string[]; // Web search queries from 'tool_result' events
}

interface MessageProps {
  message: MessageData;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  // Only show thoughts and web search for assistant messages
  const showThought = !isUser && message.thought;
  const showWebSearch = !isUser && message.webSearchQueries && message.webSearchQueries.length > 0;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-gray-900 text-white'
            : 'bg-gray-900 text-white'
        }`}
      >
        {/* Thoughts - shown before content for assistant messages */}
        {showThought && (
          <Thought thought={message.thought!} id={message.id} createdAt={message.timestamp} />
        )}

        {/* Web Search Modality - shown before content for assistant messages */}
        {showWebSearch && (
          <WebSearchModality 
            queries={message.webSearchQueries!} 
            createdAt={message.timestamp}
          />
        )}

        {/* Message Content */}
        {message.content && (
          <div className="text-sm whitespace-pre-wrap break-words text-white">
            <ReactMarkdown
              components={{
                // Style links
                a: ({ ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white underline break-all"
                  />
                ),
                // Style bold text
                strong: ({ ...props }) => (
                  <strong {...props} className="font-semibold" />
                ),
                // Style paragraphs
                p: ({ ...props }) => (
                  <p {...props} className="mb-2 last:mb-0" />
                ),
                // Style lists
                ul: ({ ...props }) => (
                  <ul {...props} className="list-disc list-inside mb-2 space-y-1" />
                ),
                li: ({ ...props }) => (
                  <li {...props} className="ml-4" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div
          className={`text-xs mt-2 opacity-70 text-gray-400`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
