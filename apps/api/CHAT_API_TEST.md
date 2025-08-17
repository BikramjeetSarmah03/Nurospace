# Chat API Endpoints Test Guide

## New Endpoints Added

### 1. GET `/api/v1/chat` - List All Chats
**Purpose:** Get all chats for the authenticated user

**Response:**
```json
{
  "success": true,
  "chats": [
    {
      "id": "chat-id",
      "title": "Chat Title",
      "slug": "chat-slug",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. GET `/api/v1/chat/:slug` - Get Specific Chat with Messages
**Purpose:** Get a specific chat and all its messages

**Response:**
```json
{
  "success": true,
  "chat": {
    "id": "chat-id",
    "title": "Chat Title",
    "slug": "chat-slug",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "messages": [
    {
      "id": "msg-id",
      "role": "user",
      "content": "Hello",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "msg-id-2",
      "role": "assistant", 
      "content": "Hi there!",
      "createdAt": "2024-01-01T00:01:00Z"
    }
  ]
}
```

### 3. DELETE `/api/v1/chat/:slug` - Delete Chat
**Purpose:** Delete a specific chat and all its messages

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

## Testing with curl

### List all chats:
```bash
curl -X GET "http://localhost:3000/api/v1/chat" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get specific chat:
```bash
curl -X GET "http://localhost:3000/api/v1/chat/your-chat-slug" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete chat:
```bash
curl -X DELETE "http://localhost:3000/api/v1/chat/your-chat-slug" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Changes

### 1. Chat List Page (`/c/`)
- Now shows list of existing chats
- Click to navigate to specific chat
- Shows loading state while fetching

### 2. Chat Page (`/c/:chatId`)
- Now loads existing messages on page load
- Shows loading state while fetching history
- Maintains all existing functionality

## Expected Behavior

1. **First Load:** Shows loading spinner, then chat list or welcome message
2. **Click Chat:** Navigates to chat with full message history
3. **New Chat:** Creates new chat and navigates to it
4. **Refresh:** Maintains chat state and history

The chat history should now persist and load properly on first visit! 🎉 