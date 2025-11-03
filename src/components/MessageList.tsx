import { useEffect, useRef } from 'react';
import { Message } from './Message';
import type { MessageData } from './Message';

interface MessageListProps {
  messages: MessageData[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2 text-white">Welcome to FinSense</p>
          <p className="text-sm text-gray-400">Start a conversation by typing a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 bg-black">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
