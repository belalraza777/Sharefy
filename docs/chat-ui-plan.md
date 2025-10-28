# Sharefy – Chat UI Plan

Last updated: 2025-10-28

## Current state (from code)

Backend
- REST
  - GET /api/v1/chat/users → returns array of user objects the logged-in user has conversations with (populated from Conversation.members, password excluded).
  - GET /api/v1/chat/get/:id → returns array of Message docs (senderId, receiverId, message, createdAt). If no conversation, returns `{ success:false, data:[] }` with status 200.
  - POST /api/v1/chat/send/:id { message } → creates Message, ensures Conversation, returns saved Message.
- Socket.IO
  - Server at http://localhost:8000 with JWT auth via `handshake.auth.token`.
  - Tracks `onlineUsers` map; no presence events emitted to clients yet.
  - Emits `newMessage` to the receiver only when a message is sent.

Frontend
- State (Zustand) in `src/store/chatStore.js`
  - conversations: User[]; messages: Record<userId, Message[]>; activeUserId; loading; error.
  - fetches conversations and messages; `sendMessage` updates local cache; `addIncomingMessage` appends under `senderId`.
- API wrapper in `src/api/chatApi.js` against the above endpoints.
- Socket client in `src/socket.js` connects with token and listens to `newMessage` but doesn’t update UI/store.
- No dedicated Chat pages/components yet in `src/pages` or `src/components`.

## Gaps and considerations
- Presence/online indicators aren’t exposed from backend to clients.
- Typing indicators and read receipts are not implemented.
- Message pagination/virtualization not implemented; all messages fetched at once.
- Error handling: backend returns 200 with `{ success:false }` for empty conversation; frontend currently treats any 2xx as `success:true`—works but can be clarified.
- Auth token wiring for Socket.IO must come from Auth context when user logs in.

## Chat UI v1 scope
Aim: A clean, responsive, real-time 1:1 messaging UI with conversations list and message thread.

Screens
1) Chat page (desktop split view; mobile stacked)
- Left: Conversations list + search
- Right: Message thread for active user + composer

Components
- ConversationList (fetches on mount via store.getConversations)
- ConversationListItem (avatar, name, last message preview, unread badge, online dot)
- MessageThread (renders MessageBubble for current `activeUserId` from store.messages)
- MessageBubble (mine vs theirs styles, timestamp)
- MessageComposer (text input + send button; Enter to send)
- EmptyState (when no conversation selected)
- TypingIndicator (optional later)

Routing
- New route: `/chat` (default shows EmptyState), `/chat/:userId` sets `activeUserId` and loads messages.

State/data flow
- On Chat page mount: `useChatStore.getConversations()`.
- On selecting a user (or route change): `setActiveUser(userId)` triggers `getMessages(userId)` if needed.
- Sending: `sendMessage(userId, text)` → POST → append to `messages[userId]`; also emit socket for instant delivery (optional; server already returns saved message).
- Realtime: subscribe to socket `newMessage`; call `addIncomingMessage(message)`; if `activeUserId !== message.senderId`, mark conversation as unread.

Styling
- Reuse existing CSS conventions; light/dark compatible where possible.
- Mobile: full-screen thread; swipe/back to list; sticky composer.

## Contracts (data shapes)
Message
```
{
  _id: string,
  senderId: string,
  receiverId: string,
  message: string,
  createdAt: string,
  updatedAt: string
}
```
Conversation list item (User model subset)
```
{
  _id: string,
  name: string,
  username: string,
  avatar?: string
}
```
Store shape
```
conversations: User[]
messages: Record<userId, Message[]>
activeUserId: string | null
loading: boolean
error: string | null
```

## Edge cases to handle
- No conversation history → show friendly empty state, allow starting message.
- First message to a user not in list → allow compose in profile/user card; list updates upon first message.
- Duplicate appends on realtime + REST → rely on `_id` de-duplication or only use server response once.
- Rapid sends (optimistic UI) → handle pending state; disable send while empty.
- Large history → paginate with “Load previous messages”.

## Implementation tasks (v1)
1) Routing and page shell
- Add routes `/chat` and `/chat/:userId` in `src/routes/AppRoute.jsx`.
- Create `src/pages/Chat/ChatPage.jsx` with layout (list + thread) and responsive CSS.

2) Conversations list
- Components: `ConversationList.jsx`, `ConversationListItem.jsx` (+ CSS).
- Integrate `useChatStore.getConversations` on mount.
- Clicking item navigates to `/chat/:userId` and sets active user.

3) Message thread
- Components: `MessageThread.jsx`, `MessageBubble.jsx` (+ CSS).
- On mount/param change: `setActiveUser(userId)`; render messages from store.
- Auto-scroll to bottom on new messages.

4) Composer
- `MessageComposer.jsx` with textarea/input + send button.
- Calls `useChatStore.sendMessage(activeUserId, text)`; clears input.
- Disable when no active user or empty text.

5) Socket wiring
- In Chat page root effect, register `socket.on('newMessage', handle)` to call `useChatStore.getState().addIncomingMessage(msg)`; clean up on unmount.
- Ensure socket connects after login using token from `authContext` (already used in src/socket.js connectSocket).

6) Unread badges (basic)
- Track a `unreadCounts: Record<userId, number>` in store; increment on incoming when not active; clear when opening thread.

7) Minimal error/loading UX
- Spinners for list/thread; toast or inline error message from `store.error`.

## Nice-to-haves (post-v1)
- Presence: backend emit `presence:update` on connect/disconnect with list of online userIds; frontend show online dot.
- Typing indicators: `typing:start`/`typing:stop` per conversation.
- Message pagination (server: limit/skip; client: infinite scroll).
- Message status (sent/delivered/read) with checkmarks.
- Attachments (images), emoji picker.

## Backend notes (small tweaks)
- Consider emitting presence list:
  - On connect: `io.emit('presence:update', Object.keys(onlineUsers))`.
  - On disconnect: same.
- Consider making `GET /chat/get/:id` return `{ success:true, data:[] }` when empty to simplify client conditions.
- Add optional query params: `?limit=50&before=timestamp` for pagination later.

## Acceptance criteria (v1)
- User can see list of chat users on `/chat`.
- Selecting a user opens thread and loads history.
- User can send messages; they appear instantly and persist on refresh.
- Incoming messages appear in real-time without refresh.
- Responsive layout works on mobile and desktop.
- Basic unread badge increments for inactive threads.
