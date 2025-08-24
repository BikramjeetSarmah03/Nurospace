# Chat Components

This directory contains the core chat components for the Nurospace AI dashboard.

## Components

### ChatBox
The main chat input component that handles user message input and submission.

**Features:**
- Text input with auto-resize
- Document/file mention system (@)
- File upload support
- Smart mention popup with categories
- **NEW: Stop button for ongoing chats**

**Props:**
```tsx
interface ChatBoxProps {
  onSubmit: (value: string, context?: { documents: ResourceDocument[] }) => void;
  onStop?: () => void;           // NEW: Function to stop ongoing chat
  canStop?: boolean;             // NEW: Whether stop button should be shown
  isLoading?: boolean;           // NEW: Whether a chat is currently in progress
}
```

**Stop Button Behavior:**
- Only appears when `canStop={true}` and `isLoading={true}`
- Red square button with hover effects
- Clicking stops the ongoing chat generation
- Uses AbortController to cancel fetch requests

### ChatMessages
Displays the conversation history between user and AI.

**Features:**
- Auto-scrolling to latest messages
- Thinking indicator when AI is generating response
- Scroll-to-bottom button for long conversations
- Welcome screen for new chats

### Message
Individual message component for user and AI messages.

### ResourceToolbar
Toolbar for managing document resources in chat context.

### ResourceDialog
Dialog for selecting and managing document resources.

### MessageFeedback
Component for collecting user feedback on AI responses.

### MentionPopup
Smart popup for mentioning tools, files, and resources.

## Stop Functionality Implementation

The stop functionality has been implemented across all chat pages:

### 1. Chat Page (`chat-page.tsx`)
- New chat creation with stop capability
- AbortController for request cancellation
- Stop button state management

### 2. Update Chat Page (`update-chat.tsx`)
- Existing chat continuation with stop capability
- Same AbortController pattern
- Consistent stop button behavior

### 3. Key Features
- **AbortController**: Cancels ongoing fetch requests
- **Visual Feedback**: Red stop button with hover effects
- **State Management**: Proper loading and stop button states
- **Error Handling**: Graceful handling of cancelled requests
- **User Notification**: Toast message when chat is stopped

### 4. Usage Example
```tsx
const [loading, setLoading] = useState(false);
const [canStop, setCanStop] = useState(false);
const abortControllerRef = useRef<AbortController | null>(null);

const handleStopChat = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    setCanStop(false);
    setLoading(false);
    toast.info("Chat stopped");
  }
};

const handleSendChat = async (value: string) => {
  setLoading(true);
  setCanStop(true);
  abortControllerRef.current = new AbortController();
  
  try {
    const res = await fetch(url, {
      signal: abortControllerRef.current.signal,
      // ... other options
    });
    // ... handle response
  } catch (error) {
    if (error.name === 'AbortError') return; // Request cancelled
    // ... handle other errors
  } finally {
    setLoading(false);
    setCanStop(false);
    abortControllerRef.current = null;
  }
};
```

## File Structure
```
src/features/chat/
├── components/
│   ├── chat-box.tsx          # Main chat input with stop button
│   ├── chat-messages.tsx     # Message display
│   ├── message.tsx           # Individual message
│   ├── resource-toolbar.tsx  # Resource management
│   ├── resource-dialog.tsx   # Resource selection
│   ├── message-feedback.tsx  # Feedback collection
│   ├── mention-popup.tsx     # Smart mentions
│   └── README.md            # This file
├── pages/
│   ├── chat-page.tsx         # New chat with stop
│   └── update-chat.tsx       # Existing chat with stop
└── ...
```

## Styling
The stop button uses Tailwind CSS classes:
- `bg-red-500`: Red background
- `hover:bg-red-600`: Darker red on hover
- `hover:scale-105`: Slight scale up on hover
- `active:scale-95`: Scale down when clicked
- `transition-all duration-200`: Smooth animations
