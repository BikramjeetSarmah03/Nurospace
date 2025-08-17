# Message Feedback System

This system provides interactive feedback options below each AI message in the chat interface.

## Components

### MessageFeedback
The main feedback component that displays below AI messages with the following options:

1. **Copy** - Copies the message content to clipboard
2. **Good Response** - Marks the response as helpful (thumbs up)
3. **Bad Response** - Marks the response as unhelpful (thumbs down)
4. **Read Aloud** - Uses browser's speech synthesis to read the message
5. **Retry** - Triggers a retry action for the message

## Features

- **Hover to Reveal**: Feedback options only appear when hovering over a message
- **Visual Feedback**: Buttons show different states (copied, good/bad feedback)
- **Accessibility**: Proper tooltips and keyboard navigation support
- **Responsive**: Works on both desktop and mobile devices
- **Customizable**: Easy to extend with additional feedback options

## Usage

### Basic Implementation

```tsx
import MessageFeedback from './message-feedback';

<MessageFeedback
  messageId="msg-123"
  messageContent="Your AI response content here"
  onCopy={() => console.log("Copied!")}
  onGoodResponse={() => console.log("Good response!")}
  onBadResponse={() => console.log("Bad response!")}
  onReadAloud={() => console.log("Reading aloud...")}
  onRetry={() => console.log("Retrying...")}
/>
```

### With Custom Hook

```tsx
import { useMessageFeedback } from './hooks/use-message-feedback';

const {
  copied,
  feedback,
  handleCopy,
  handleFeedback,
  handleReadAloud,
  handleRetry,
} = useMessageFeedback();
```

## Styling

The feedback component uses Tailwind CSS classes and includes:
- Smooth transitions and hover effects
- Color-coded feedback states (green for good, red for bad)
- Subtle borders and spacing
- Responsive design

## Customization

### Adding New Feedback Options

1. Add new props to `MessageFeedbackProps` interface
2. Create new button elements in the component
3. Implement corresponding handlers
4. Update the `useMessageFeedback` hook if needed

### Styling Modifications

Override the default classes by passing a `className` prop:

```tsx
<MessageFeedback
  className="custom-feedback-styles"
  // ... other props
/>
```

## Browser Support

- **Copy**: Uses modern Clipboard API with fallback
- **Read Aloud**: Uses Web Speech API (supported in most modern browsers)
- **Hover Effects**: CSS transitions with fallbacks for older browsers

## Integration

The feedback system is designed to work with existing chat components:

1. Import `MessageFeedback` into your message component
2. Pass the required props (messageId, messageContent)
3. Implement callback functions for your use case
4. Style as needed to match your design system

## Future Enhancements

- Analytics tracking for feedback data
- Custom feedback categories
- Voice feedback recording
- Integration with AI model training
- Multi-language support for read aloud
