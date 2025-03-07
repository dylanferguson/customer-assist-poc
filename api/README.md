# Messaging Service RESTful API

## Base URL
```
https://api.messagingservice.com/v1
```

## Authentication
All API requests require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

## Error Handling
The API returns appropriate HTTP status codes:
- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 500: Server error

Error responses will include a JSON body with an error message:
```json
{
  "error": "Error message description"
}
```

## Rate Limiting
- 1000 requests per hour per API key
- Response headers include rate limit information:
  - X-RateLimit-Limit: Maximum requests per hour
  - X-RateLimit-Remaining: Remaining requests for the current hour
  - X-RateLimit-Reset: Unix timestamp when the limit resets

## Resources

### Conversations

#### Create a conversation
```
POST /conversations
```

Request body:
```json
{
  "title": "Optional title for the conversation"
}
```

Response:
```json
{
  "id": "conv_123456789",
  "title": "Title", // Defaults to "New Conversation"
  "status": "open",  // "open" | "closed"
  "user_id": "usr_123456789",
  "createdAt": "2025-02-27T15:00:00Z",
  "updatedAt": "2025-02-27T15:00:00Z",
  "unread_count": 2,
  "closedAt": null,
  "archived": false,
  "archivedAt": null
}
```

#### Get conversations list
```
GET /conversations
```
Sort order is based on most recent activity

Query parameters:
- `limit`: Maximum number of conversations to return (default: 20, max: 100)
- `cursor`: Last conversation ID from previous response. Optional for first request.
- `order`: `asc` or `desc` (default: `desc`)
- `is_archived`: true or false (default: false)

Response:
```json
{
  "conversations": [
    {
      "id": "conv_123456789",
      "title": "New Conversation",
      "status": "open",
      "user_id": "usr_123456789",
      "createdAt": "2025-02-27T15:00:00Z",
      "updatedAt": "2025-02-27T15:00:00Z",
      "unread_count": 2,
      "closedAt": null,
      "archived": false,
      "archivedAt": null,
      "lastMessage": {
        "id": "msg_567890123",
        "content": "Let's discuss the new feature",
        "participantRole": "CUSTOM_BOT", // "CUSTOM_BOT" | "CUSTOMER" | "AGENT" | "SYSTEM" | "SUPERVISOR"
        "participantName": "bot_123456789",
        "createdAt": "2025-02-27T15:05:00Z"
      }
    }
  ],
  "_links": {
    "next": {
        "href": "/v1/conversations?cursor=conv_312404012&limit=20&order=desc"
    }
  }
}
```

#### Get conversation details
```
GET /conversations/{conversationId}
```

Response:
```json
{
    "id": "conv_123456789",
    "title": "New Conversation",
    "status": "open",
    "user_id": "usr_123456789",
    "createdAt": "2025-02-27T15:00:00Z",
    "updatedAt": "2025-02-27T15:00:00Z",
    "unread_count": 2,
    "closedAt": null,
    "archivedAt": null,
    "archived": false,
}
```

#### Get conversation details messages
```
GET /conversations/{conversationId}/messages
```

Response:
```json
{
    "data": [
        {
            "id": "msg_123456789",
            "content": "Hello, how are you?",
            "contentType": "plain_text",
            "createdAt": "2025-02-27T15:00:00Z",
            "participantRole": "CUSTOM_BOT",
            "participantName": "bot_123456789"
        },
        {
            "id": "msg_123456789",
            "content": "I'm good, thank you!",
            "contentType": "plain_text",
            "createdAt": "2025-02-27T15:00:00Z",
            "participantRole": "CUSTOMER",
            "participantName": "John Doe"
        }
    ],
    "_links": {
        "next": {
            "href": "/v1/conversations?cursor=conv_312404012&limit=20&order=desc"
        }
    }
}
```

### Conversation Management

#### Update conversation details
```
PATCH /conversations/{conversationId}
```

Request body:
```json
{
  "status": "closed"  // "closed" | "open"
  "archived": true // true | false
  "subject": "Updated subject"
}
```

Response:
```json
{
    "id": "conv_123456789",
    "title": "Updated subject",
    "status": "closed",
    "user_id": "usr_123456789",
    "createdAt": "2025-02-27T15:00:00Z",
    "updatedAt": "2025-02-27T15:00:00Z",
    "unread_count": 0,
    "archived": true,
    "closedAt": "2025-02-27T15:00:00Z",
    "archivedAt": "2025-02-27T15:00:00Z",
}
```

#### Send a message
```
POST /conversations/{conversationId}/messages
```

Request body:
```json
{
  "content": "Hello, how are you?"
}
```

Response:
```json
{
  "id": "msg_123456789",
  "content": "Hello, how are you?",
  "contentType": "plain_text",
  "createdAt": "2025-02-27T15:00:00Z",
  "participantRole": "CUSTOMER",
  "participantName": "John Doe"
}
```

## WebSocket API

### Connection
WebSocket endpoint:
```
wss://api.messagingservice.com/v1/ws
```

Connection requires the same JWT authentication token as the REST API, sent as a query parameter:
```
wss://api.messagingservice.com/v1/ws?token={jwt_token}
```

### Message Format
All WebSocket messages are JSON objects with the following structure:

```json
{
  "type": "message_type",
  "payload": {
    // message-specific data
  }
}
```

### Server Events
The server will emit the following events:

#### New Message
```json
{
  "type": "new_message",
  "payload": {
    "conversation_id": "conv_123456789",
    "message": {
      "id": "msg_123456789",
      "content": "Hello, how are you?",
      "contentType": "plain_text",
      "createdAt": "2025-02-27T15:00:00Z",
      "participantRole": "AGENT",
      "participantName": "John Doe"
    }
  }
}
```

### Connection Management
- The server will send periodic ping messages to keep the connection alive
- Clients should respond with pong messages
- If no pong is received after 30 seconds, the connection will be closed
- Clients should implement reconnection logic with exponential backoff