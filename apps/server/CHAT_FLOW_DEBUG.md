# Chat Flow Debug Guide

## Issue: Slug Error on First Use

### Problem Description:
When user first uses the software and asks a question, it should automatically create a slug and route to `/hello` (or whatever the first message generates).

### Current Flow:

1. **User visits `/c`** (new chat page)
2. **User types message** and hits send
3. **`handleSendChat`** creates slug from message
4. **POST request** sent to `/api/v1/chat` with slug
5. **Navigate** to `/c/$chatId` with the slug
6. **Chat page loads** and tries to load history for that slug

### Expected Flow:

1. **User types "Hello"** → slug becomes "hello"
2. **POST to `/api/v1/chat`** with `{ message: "Hello", slug: "hello" }`
3. **Server creates chat** with slug "hello"
4. **Navigate to `/c/hello`**
5. **Chat page loads** and finds the chat exists

### Debug Steps:

1. **Check Network Tab:**
   - Look for POST request to `/api/v1/chat`
   - Verify it includes `message` and `slug` in body
   - Check response status

2. **Check Server Logs:**
   - Look for "[DEBUG] Created new chat" message
   - Verify slug is being created correctly

3. **Check Database:**
   - Verify chat is created in database
   - Check slug matches expected value

4. **Check Frontend:**
   - Verify navigation happens correctly
   - Check if chat page loads without errors

### Common Issues:

1. **Slug Generation:** Message might be empty or too short
2. **Navigation:** Route might not match expected pattern
3. **Database:** Chat creation might fail
4. **404 Error:** Chat page tries to load non-existent chat

### Testing:

```bash
# Test API directly
curl -X POST "http://localhost:3000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hello", "slug": "hello"}'
```

### Fix Applied:

1. **Updated `handleSendChat`** to actually send POST request before navigation
2. **Added error handling** for chat creation
3. **Updated chat page** to handle 404 errors gracefully
4. **Added proper message mapping** for type safety

The flow should now work correctly for first-time users! 🎉 