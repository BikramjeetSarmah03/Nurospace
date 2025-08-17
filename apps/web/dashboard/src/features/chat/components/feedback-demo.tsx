import React from "react";
import Message from "./message";
import type { IMessage } from "@/features/chat/types/chat";

const sampleMessages: IMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Can you help me create a React component?",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    role: "assistant",
    content: `Sure! Here's a simple React component example:

\`\`\`tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      }\`}
    >
      {children}
    </button>
  );
}
\`\`\`

This component includes:
- TypeScript interfaces for type safety
- Conditional styling based on variant prop
- Hover effects and transitions
- Proper accessibility with button element`,
    createdAt: new Date().toISOString(),
  },
];

export default function FeedbackDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Message Feedback Demo</h1>
        <p className="text-muted-foreground">
          Hover over AI messages to see feedback options
        </p>
      </div>
      
      <div className="space-y-4">
        {sampleMessages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Features: Copy, Good/Bad Response, Read Aloud, Retry</p>
      </div>
    </div>
  );
}
