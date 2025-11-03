import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface ThoughtProps {
  thought: string;
  createdAt?: Date;
}

export function Thought({ thought, createdAt }: ThoughtProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderMarkdown, setRenderMarkdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isNew = createdAt 
    ? Date.now() - createdAt.getTime() < 2500
    : false;

  const handleToggle = () => {
    if (!isExpanded) {
      setRenderMarkdown(true);
      setIsExpanded(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      setIsExpanded(false);
      timeoutRef.current = setTimeout(() => {
        setRenderMarkdown(false);
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!thought?.trim()) return null;

  return (
    <div className="gap-2 mb-2">
      {/* Thoughts Title - Clickable */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-gray-100 hover:text-white transition-opacity opacity-80 hover:opacity-100 group/thought cursor-pointer w-full text-left"
      >
        <span className={`relative inline-block ${isNew ? 'shimmer-text' : ''}`}>
          Thoughts
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${isExpanded ? '-rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden pb-1">
          <div
            className={`p-4 max-w-full w-full gap-3 bg-gray-800 border border-gray-700 rounded-lg transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {renderMarkdown && (
              <div className="text-sm text-gray-100">
                <ReactMarkdown
                  components={{
                    p: ({ ...props }) => (
                      <p {...props} className="mb-2 last:mb-0" />
                    ),
                    strong: ({ ...props }) => (
                      <strong {...props} className="font-semibold" />
                    ),
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white underline"
                      />
                    ),
                    ul: ({ ...props }) => (
                      <ul {...props} className="list-disc list-inside mb-2 space-y-1" />
                    ),
                    li: ({ ...props }) => (
                      <li {...props} className="ml-4" />
                    ),
                  }}
                >
                  {thought.trim()}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

