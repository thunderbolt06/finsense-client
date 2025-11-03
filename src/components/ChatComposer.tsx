import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';

const MIN_TEXTAREA_HEIGHT = 40;
const MAX_TEXTAREA_HEIGHT = 200;

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export interface ChatComposerRef {
  focus: () => void;
}

export const ChatComposer = forwardRef<ChatComposerRef, ChatComposerProps>(
  ({ onSend, disabled = false }, ref) => {
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT
    );

    textarea.style.height = `${newHeight}px`;
  }, []);

  // Expose focus method to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  // Focus textarea when it becomes enabled (after loading finishes)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      // Small delay to ensure the DOM is ready
      const timeoutId = setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    resizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || disabled) return;

    onSend(trimmedContent);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
      // Focus the textarea after sending to keep it active
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const canSend = content.trim().length > 0 && !disabled;

  return (
    <div className="p-2 bg-gray-900 border border-gray-10 rounded-lg">
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 p-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onInput={resizeTextarea}
            placeholder="Ask FinSense..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none overflow-y-auto focus:outline-none bg-gray-900 text-xs text-gray-100 placeholder:text-gray-100 disabled:opacity-60"
            style={{
              minHeight: `${MIN_TEXTAREA_HEIGHT}px`,
              maxHeight: `${MAX_TEXTAREA_HEIGHT}px`,
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex items-center justify-center rounded-full w-8 h-8 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
});
