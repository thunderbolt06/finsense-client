import { useState } from 'react';

interface WebSearchModalityProps {
  queries: string[];
  createdAt?: Date;
}

export function WebSearchModality({ queries, createdAt }: WebSearchModalityProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isNew = createdAt 
    ? Date.now() - createdAt.getTime() < 2500
    : false;

  if (!queries || queries.length === 0) return null;

  const firstQuery = queries[0];
  const otherQueries = queries.slice(1);

  return (
    <div className="gap-2 mb-2">
      {/* Modality Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left cursor-pointer group/modality-item"
      >
        <div className="flex items-center gap-2 text-gray-100">
          {/* Globe icon for web search */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className={`text-sm ${isNew ? 'shimmer-text' : ''}`}>
            Searched the web
          </span>
        </div>
        <div className="flex items-center gap-2">
          {queries.length > 1 && (
            <span className="text-xs text-gray-100 opacity-0 group-hover/modality-item:opacity-100 transition-opacity delay-150">
              {queries.length} {queries.length === 1 ? 'query' : 'queries'}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-100 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-200 ease-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="pt-2">
          <ul className="flex flex-col gap-2">
            {queries.map((query, i) => (
              <li
                key={`${query}-${i}`}
                className="flex items-center gap-2 text-sm text-gray-100"
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              >
                {/* Search icon */}
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
                  className="shrink-0 text-gray-100"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span>{query}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

