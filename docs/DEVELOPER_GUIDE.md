# Sharefy Developer Guide

> Purpose: Give new contributors a fast, high‑signal understanding of the platform architecture, current feature set, dark mode/theming implementation, and clear future roadmap.

## 1. High‑Level Overview
Sharefy is a full‑stack social platform enabling users to create posts, interact (likes, comments, saves, shares), follow other users, exchange real‑time messages, view ephemeral stories, receive notifications, and manage profiles. It is split into:
- Backend: Node.js (ES modules) + Express + Mongoose + Socket.io
- Frontend: React (Vite) + CSS (custom + variables) + Zustand for client state + Context for theming/auth
- Realtime: Socket.io (chat + live notifications)
- Media: Cloudinary via multer storage adapter
- Auth: JWT + OTP for email verification and password flows

## 2. Backend Architecture
Directory: `Backend/`

### Entry Points
- `server.js` / `index.js` (script targets in package.json) – bootstraps Express server, connects DB, mounts middleware, starts Socket.io.
- `app.js` – Express app configuration (middleware ordering, security headers, JSON parsing, CORS, sanitization).

### Key Folders
- `controllers/` – Business logic per resource (auth, user, post, comment, notification, saved posts, stories, search, chat). Each controller receives validated/sanitized input and orchestrates model operations.
- `models/` – Mongoose schemas representing domain entities (users, posts, comments, follows, conversations, messages, notifications, feeds, saved posts, stories). Relations primarily via ObjectId references.
- `routes/` – Express routers wiring HTTP verbs + paths to respective controller handlers; attaches auth or rate‑limit middleware where required.
- `utils/` – Cross‑cutting helpers:
  - `asyncWrapper.js` – Standard try/catch abstraction to centralize error propagation.
  - `cloudinary.js` – Cloudinary config + helper uploads.
  - `email.js` – Nodemailer transport + templating for OTP / notifications.
  - `errorClass.js` – Custom error extension for consistent HTTP error shaping.
  - `joiValidation.js` – Request schema validation definitions.
  - `otp.js` – OTP generation & verification using `otplib`.
  - `rateLimit.js` – Express rate limit configuration.
  - `sanitizer.js` – Input sanitization (XSS, mongo sanitization wrappers).
  - `uploadMiddleware.js` – Multer + Cloudinary storage pipeline for media uploads.
  - `verifyAuth.js` – JWT verification + user extraction middleware.
- `socket.js` – Socket.io server events binding (message channels, typing indicators, notification pushes).

### Core Middleware Stack
1. Security: `helmet`, `cors`, `express-rate-limit`, `xss-clean`, `express-mongo-sanitize`
2. Parsing: `express.json`, multipart handling via `multer`
3. Auth: `verifyAuth` for protected routes
4. Error handling: Central error translator using `errorClass`

### Auth Flow
- Registration → OTP email verification → JWT issuance
- Login → JWT (access) stored client side (likely in memory/localStorage)
- Password reset via emailed OTP link or code

#### OTP implementation (current)
- Generation: backend generates a short numeric OTP (e.g., 6 digits) and sends the plaintext to the user's email via `email.js`.
- Storage: instead of storing plaintext on the user document, the server now stores a hashed OTP in a dedicated `Otp` collection. Each `Otp` document contains a reference to the target user, the hashed OTP, and an `expiresAt` timestamp.
- Expiry & cleanup: `Otp` has a TTL index on `expiresAt` so expired OTP documents are removed automatically by MongoDB.
- Verification: when the user submits the OTP, the server looks up the `Otp` doc for that user, verifies the code using `bcrypt.compare` against the hashed value, and — on success — deletes the `Otp` doc and proceeds (mark user verified or allow password reset). On failure, return a standard error; expired or missing docs are treated as invalid/expired.
- Rationale: this prevents plaintext or reusable OTPs in user documents, allows short-lived OTPs via TTL index, and aligns with best practices for one-time codes.

Implementation notes:
- Model: `Backend/models/otpModel.js` (fields: `user: ObjectId`, `otpHash: String`, `expiresAt: Date`).
- Controller: `authController.js` now creates `Otp` docs on generation and validates+removes them on verification. The controller also respects rate limits for OTP generation and verification attempts.
- Email: `email.js` still sends the plaintext OTP to the user's email; only the hashed version is persisted.

### Realtime Messaging & Notifications
- Conversations: `conversationModel` with participant array
- Messages: `messageModel` referencing conversation + sender
- Socket events: join room per conversation, emit new message + notifications to targeted users.

## 3. Frontend Architecture
Directory: `Frontend/`

### Tooling
- Vite for fast dev (`npm run dev`), build (`npm run build`), preview (`npm run preview`).
- ESLint with React hooks & refresh rules (`npm run lint`).

### Application Structure
- `index.html` – Root HTML shell
- `src/main.jsx` – React root rendering `<App />`
- `src/App.jsx` – Top‑level layout + providers (Auth, Theme, Routing, Toasts)
- `src/routes/` – `AppRoute.jsx`, `ProtectedRoute.jsx` manage route guarding & mapping pages.
- `src/pages/` – Feature screens (Feed, Post, Chat, Notification, SavedPost, Search, Settings, User_Profile, New_Post, Theme).
- `src/components/` – Modular UI: buttons, post card, chat, layout pieces, skeletons, search results, stories, forms.
- `src/context/` – Global contexts (`authContext.jsx`, `themeContext.jsx`).
- `src/store/` – Zustand stores for domain slices (chat, comment, notification, post, savedPost, search, story, user) to keep components lean & minimize prop drilling.
- `src/api/` – Axios wrappers per resource (authApi, postApi, chatApi, etc.) centralizing endpoints & error normalization.
- `src/styles/` – Global animations & shared CSS. Theming variables live in `index.css`.

### State Management Choices
- Lightweight global domain states with Zustand (simplicity, good for ephemeral lists, websockets integration) instead of Redux.
- Context for cross‑cutting concerns (theme, auth) where state rarely changes per render.

### Component Patterns
- Separation into functional categories: `Layout`, `Buttons`, `chat`, `post`, `Story`, `user` etc.
- Each reusable component has a dedicated CSS file or shares a semantic set of CSS variables.
- Skeleton loading states centralize consistent shimmering backgrounds for both themes.

## 4. Data Model Summaries (High Level)
(Exact schema fields in `models/` – below are conceptual.)
- User: profile info, avatar URL (Cloudinary), bio, followers/following counts.
- Post: author ref, media (image/video), caption, tags, timestamps, metrics (likes, comments, saves, shares).
- Comment: post ref, user ref, text, timestamps.
- Follow: follower & following user refs (may be implicit via arrays or separate model depending on final schema).
- Conversation: participants array, last message pointer.
- Message: conversation ref, sender ref, content (text/media), status (seen), timestamps.
- Notification: actor ref, target ref, type (like, comment, follow, message), read flag.
- SavedPost: user ref + post ref linking user library.
- Stories: user ref, media, expiry timestamp.
- Feed: aggregation helper (could store algorithmic feed slices).

## 5. Theming & Dark Mode System
Implemented on branch `feat/dark_mode`.

### Core Pieces
- `themeContext.jsx`: Provides `theme` (light|dark|system) + setter, persists in `localStorage` (`sharefy-theme`), listens to `prefers-color-scheme` changes.
- DOM attribute: `html[data-theme="dark"]` toggles CSS variable overrides.
- CSS Variables: Defined in `index.css` for base + dark palette (text, dim text, surfaces, borders, button states, shadows).

### Strategy
1. Use semantic tokens (`--text-color`, `--surface`, `--card-bg`, `--border-color`, `--primary`, etc.) rather than direct hex references.
2. Refactor components/pages by replacing hardcoded colors with variables.
3. Provide accessible contrast (WCAG AA target) – dark backgrounds (#18191a / #242526) vs light text (#e4e6eb) and dim text (#b0b3b8).
4. Interactive elements use hover tokens (`--btn-bg-hover`, `--surface-alt`) for subtle elevation.
5. Removed inline styles in theme page to unify styling in CSS.

### Completed Theme Coverage
- Layout (Header, Sidebars, Mobile nav)
- Pages: Notification, Chat (all subcomponents), Settings, Single Post, New Post, User Profile
- Components: Buttons (share/like/follow/save/logout), Post card, Skeleton loaders, Search results, Story components, Profile edit forms, Options menu

### Future Theme Enhancements
- Introduce dynamic theme preview in settings before commit.
- Add optional high‑contrast theme variant.
- Provide CSS variable fallback for older browsers (low priority).

## 6. Development Setup
### Requirements
- Node.js (LTS) + npm
- MongoDB instance (local or hosted)
- Cloudinary account credentials
- SMTP credentials for Nodemailer

### Environment Variables (sample)
Create `Backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_user
EMAIL_PASS=your_pass
OTP_WINDOW=300
```

### Install & Run
Backend:
```
cd Backend
npm install
npm run dev
```
Frontend:
```
cd Frontend
npm install
npm run dev
```
Build frontend:
```
npm run build
```
Preview build:
```
npm run preview
```

### Recommended Dev Flow
1. Run backend + frontend concurrently.
2. Use dedicated test accounts for auth flows.
3. Use browser devtools + React DevTools for store/context inspection.
4. Socket debugging: open two sessions with different users to verify chat & notifications.

## 7. API Conventions
- RESTful endpoints grouped by resource (`/api/v1/posts`, `/api/v1/users`, etc.).
- Authentication: Bearer token (JWT) in `Authorization` header for protected routes.
- Validation: Joi schemas per controller; request rejected early on invalid input.
- Sanitization: XSS & NoSQL injection mitigations before controller logic.
- Error format: `{ success: false, message, code, details? }` (from `errorClass.js`).
- Pagination: Likely via query params (`?page=&limit=`) – ensure indexes on frequently queried fields.
- Rate limiting: Sensitive endpoints (auth) behind `express-rate-limit`.

## 8. Testing (Current & Needed)
Current state: Minimal (package.json test script placeholder). No formal backend or frontend automated tests yet.
Future testing plan:
- Backend: Jest or Vitest + Supertest for route handlers.
- Frontend: Vitest + React Testing Library for components & hooks.
- E2E: Playwright or Cypress for critical flows (login, posting, chatting).
- Load: Optional artillery/k6 tests for message throughput.

## 9. Deployment Considerations
- Build static frontend assets with Vite and serve via CDN or reverse proxy.
- Run backend on Node server behind process manager (PM2) or container (Docker) with env secrets injection.
- Use HTTPS termination and WebSocket upgrade support (Nginx or similar).
- Asset storage offloaded to Cloudinary; verify usage quotas.
- Add log aggregation (Morgan → structured logs) + monitoring (Prometheus / third party).

## 10. Roadmap / Future Enhancements
### Near Term
- Add automated test suite (unit + integration) & CI pipeline.
- Performance profiling of feed queries; implement caching (Redis).
- Notification batching & read/unread indexing improvements.
- Story expiration job (cron/queue) – ensure timely deletion.
- Improve error boundaries in frontend for network failures.

### Medium Term
- Media optimization (responsive images, lazy video loading).
- Accessibility pass (ARIA roles, focus states, color contrast audit).
- Internationalization (i18n) scaffolding.
- Advanced search (hashtags, full‑text indexes, suggestion ranking).
- Offline support for message draft caching.

### Long Term
- Microservice partition (chat + feed) if scale demands.
- Recommendation engine (collaborative filtering, engagement signals).
- Push notifications (web push + mobile).
- Role‑based admin panel (moderation, analytics dashboards).

## 11. Contribution Guidelines (Suggested)
- Branch naming: `feat/...`, `fix/...`, `chore/...`, `refactor/...`, `docs/...`
- Commit style: Conventional commits (e.g., `feat: add post share analytics`).
- PR checklist: Tests added, lint passes, dark mode compatibility verified, no hardcoded colors.
- Code style: Use semantic CSS vars; avoid inline styles unless dynamic.

## 12. Quick Reference
| Area | Entry | Notes |
|------|-------|-------|
| Backend start | `npm run dev` (Backend) | Loads env, nodemon reload |
| Frontend start | `npm run dev` (Frontend) | Vite dev server |
| Theming | `themeContext.jsx` | Data attribute toggling |
| API layer | `src/api/*` | Axios centralized calls |
| State stores | `src/store/*` | Zustand slices |
| Realtime | `socket.js` / `src/socket.js` | Chat & notifications |
| Models | `models/*.js` | Mongoose schemas |
| Uploads | `uploadMiddleware.js` | Cloudinary integration |
| Validation | `joiValidation.js` | Request schemas |
| Auth middleware | `verifyAuth.js` | JWT extraction |

## 13. Onboarding Checklist for New Dev
- [ ] Clone repo & install dependencies
- [ ] Create `.env` with provided template
- [ ] Start backend + verify Mongo connection
- [ ] Start frontend & login/register test user
- [ ] Trigger chat between two accounts
- [ ] Create post with media upload
- [ ] Toggle dark mode & verify all pages
- [ ] Review `DEVELOPER_GUIDE.md` & open first issue

## 14. Known Gaps
- Lack of automated tests
- Need clearer model schemas documentation (could auto‑generate with script)
- Missing monitoring & structured logging
- Accessibility not yet audited post dark mode changes

---
Maintained by: Core Sharefy Team
Last updated: (fill in date when merging)
