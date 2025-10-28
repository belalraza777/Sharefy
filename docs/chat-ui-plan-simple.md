# Chat UI — Simple Plan

Updated: 2025-10-28

## What we’ll build (v1)
- One page with a split layout (list + thread). Mobile stacks them.
- Realtime 1:1 chat: see conversations, open a thread, send/receive messages.

## Routes
- `/chat` → shows conversation list and an empty state
- `/chat/:userId` → opens that user’s thread

## Components (minimal)
- ConversationList (fetch once on mount)
- ConversationListItem (name, avatar, optional unread badge)
- MessageThread (renders messages for active user, auto-scroll)
- MessageBubble (mine/theirs styles + timestamp)
- MessageComposer (text input + send on Enter/click)

## Data flow
- On Chat page mount: `getConversations()` from `useChatStore`.
- On select/navigate: `setActiveUser(userId)` → `getMessages(userId)` if not loaded.
- Send: `sendMessage(userId, text)` → append server result to `messages[userId]`.
- Realtime: listen `socket.on('newMessage', msg)` → `addIncomingMessage(msg)`.

## Store shape we already have
- `conversations: User[]`
- `messages: Record<userId, Message[]>`
- `activeUserId: string | null`
- `loading: boolean`, `error: string | null`

## 5 easy steps to implement
1) Routing
   - Add `/chat` and `/chat/:userId` in `src/routes/AppRoute.jsx`.
2) Page shell
   - Create `src/pages/Chat/ChatPage.jsx` (left list, right thread/composer) + simple CSS.
3) Fetch & render
   - Use `getConversations()` on mount; render items; navigate on click.
   - On `:userId` change, call `setActiveUser(userId)` and render `messages[userId]`.
4) Send message
   - `MessageComposer` calls `sendMessage(activeUserId, text)`; clear input.
5) Realtime
   - In Chat page effect, register `socket.on('newMessage', store.addIncomingMessage)`; cleanup on unmount.

## Nice-to-haves (later)
- Unread count per user, presence (online dot), typing indicator, pagination.

That’s it. When you’re ready, I can scaffold the page, route, and components next.
