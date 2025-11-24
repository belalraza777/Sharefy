# Sharefy MERN Developer Journey & Teaching Notes

> This is a structured walkthrough of how the Sharefy project was (and should be) built. Treat it as a mentor voice + revision guide for MERN fundamentals, security, architecture, and scaling considerations.

## Phase 0: Vision & Feature Scoping
Goal: Define the minimal viable social platform.
Core features chosen:
1. Auth (register/login, email verification via OTP, password reset)
2. User profile (avatar, bio, stats) + follow system
3. Posts (create/read with media, likes, comments, saves, shares)
4. Realtime chat & notifications (Socket.io)
5. Stories (ephemeral 24h content)
6. Search (users, posts)
7. Dark/Light theme toggle

Principles:
- Ship vertical slices (auth → post CRUD → interactions → realtime) instead of pure layers.
- Prefer semantic naming and modular boundaries early (controllers/models/utils).

## Phase 1: Stack & Project Initialization
Backend:
- Initialize Node project (`npm init`) and enable ES modules (`"type":"module"`).
- Install core dependencies: express, mongoose, dotenv, joi, jsonwebtoken, bcrypt.
- Add security libs early: helmet, cors, express-rate-limit, xss-clean, express-mongo-sanitize.
Frontend:
- Use Vite for fast React bootstrap (`npm create vite@latest`).
- Add axios, react-router-dom, Zustand, socket.io-client.
- Establish `src/api` abstraction before sprinkling raw axios calls.
Why early security: Retro‑fitting sanitization or rate limits later is error prone.

## Phase 2: Backend Foundation & Layering
Folder strategy:
- `app.js` configures middleware order; `server.js` boots HTTP + Socket.io.
- `models/` define persistence first (User, Post) → surface relationships early.
- `controllers/` implement business logic minimal happy path.
- `routes/` mount resource routers with proper prefix `/api/v1/...`.
Layer flow per request:
1. Route matches path/verb
2. Pre‑route middleware (auth / rate limit / validation)
3. Controller executes (using asyncWrapper for errors)
4. Response shaped uniformly
Benefits: Predictable request lifecycle simplifies debugging.

## Phase 3: Security Hardening (DO THIS EARLY)
Objectives:
- Prevent common attacks: XSS, NoSQL injection, brute force, token theft.
Checklist:
- Input validation: Joi on all mutating endpoints.
- Sanitization: `sanitize-html` + `express-mongo-sanitize` + `xss-clean`.
- Rate limiting: Apply stricter limits on `/auth/*` endpoints.
- Password hashing: bcrypt with appropriate salt rounds (balanced for performance).
- JWT best practices: short access token lifetime + potential refresh strategy (future).
- Error surfaces: never leak stack traces in production; use `errorClass` to standardize.
- CORS: lock origin list in production.
Middleware Order Pattern:
Security headers → Body parsing → Sanitization → Rate limit → Auth → Routes → Error handler.

## Phase 4: Data Modeling Strategy
Approach:
- Start with core entities: User, Post.
- Add edge entities: Follow, SavedPost, Notification, Conversation, Message, Story.
Guidelines:
- Avoid premature optimization: denormalize only when proved necessary.
- Index fields used for filtering (userId, postId, conversationId, createdAt).
- Keep optional arrays lean; consider dedicated collections for many‑to‑many (e.g., Follows).
- Plan TTL or scheduled cleanup for Stories (expiry timestamp).

## Phase 5: Authentication & Authorization
Flow:
1. Register → create user in DB (pending verification flag)
2. Generate OTP → email via Nodemailer
3. Verify OTP → mark verified → issue JWT
4. Login → validate creds → issue JWT

OTP specifics (updated):
- Generation: server creates a one‑time code and emails the plaintext to the user.
- Storage: instead of writing the OTP to the `User` document, the OTP is hashed (bcrypt) and stored in a dedicated `Otp` collection alongside an `expiresAt` timestamp.
- TTL cleanup: `Otp.expiresAt` is indexed with a TTL to remove expired records automatically.
- Verification: the server finds the corresponding `Otp` document, compares the submitted code using `bcrypt.compare` against the stored hash, and deletes the `Otp` document on success. This prevents replay and avoids keeping plaintext codes in user records.

Why this change:
- Security: hashed OTPs reduce risk if the database is exposed; separating OTPs from user documents reduces accidental leaks and simplifies cleanup.
- Reliability: TTL index handles expiry without additional cron jobs.

Notes for contributors:
- See `Backend/models/otpModel.js` for schema and TTL index.
- See `Backend/controllers/authController.js` for generation, hashing, storage, and verification logic.
5. Protected routes use `verifyAuth` middleware to decode token and attach user context.
Key Practices:
- Store only hashed passwords.
- Invalidate tokens on password change (future: maintain token version field).
- Consider adding refresh tokens & rotation for long sessions (future roadmap).

## Phase 6: Media Handling & Uploads
Implementation:
- Use Multer with Cloudinary integration (`multer-storage-cloudinary`).
- Enforce file type and size limits.
- Store returned Cloudinary URL + metadata in Post / User profile.
Security:
- Validate MIME types server‑side, never trust client input.
- Strip EXIF if privacy concerns (Cloudinary options).

## Phase 7: Realtime (Socket.io) Integration
Design:
- Namespace or single default namespace with rooms.
- Room per conversation ID for chat; event types: `message:new`, `typing:start`, `typing:stop`.
- Notifications: emit targeted events to user's personal room (`user:<id>`).
Guidelines:
- Authenticate socket connections (JWT in handshake) – if absent, disconnect.
- Rate limit message events to deter spam (app-level throttling or counters).
- Acknowledge receipts for reliability (optional future improvement).
Fallback consideration: Provide HTTP polling fallback if sockets fail (future).

## Phase 8: Frontend Architecture & State
Structure:
- Global contexts for cross-cutting (Auth, Theme).
- Zustand stores for feature slices: lean, testable, minimal boilerplate.
- API layer encapsulates endpoints + error normalization; components never call fetch directly.
Patterns:
- Pages orchestrate multiple domain stores.
- Components remain presentational when possible; push side effects to hooks or stores.
- Skeleton components unify loading states (avoid layout shift).
Revision Tip: Check that domain boundaries remain intact (no feature store leaking into unrelated pages).

## Phase 9: Theming & Dark Mode Refactor
Strategy Evolution:
1. Start with scattered hex codes.
2. Introduce CSS variables (light set).
3. Add `html[data-theme='dark']` override block.
4. Replace hardcoded colors via grep/batch operations.
5. Add ThemeContext (system detection + persistence).
Semantic Variable Categories:
- Text: `--text-color`, `--text-color-dim`
- Surfaces: `--surface`, `--surface-alt`, `--card-bg`
- Interactive: `--btn-bg`, `--btn-bg-hover`, `--primary`, `--primary-dark`
- Borders/Shadows: `--border-color`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`
Key Lessons:
- Inline styles fight theming – move to CSS.
- Use semantic naming, not brand hex codes, for scalability.
- Batch replacement carefully (verify no unintended matches).

## Phase 10: Hardening & Quality Layers
Add after core features stable:
- Logging: Structured request logs (morgan -> JSON format future).
- Monitoring: Health endpoint (/health) + status checks.
- Validation coverage audit: ensure every POST/PATCH uses Joi schemas.
- Remove dead code & unused dependencies.
- Accessibility: color contrast, focus outlines, aria labels on interactive icons.
- Lint & formatting checks in CI.

## Phase 11: Performance & Scaling Considerations
Backend:
- Query optimization: projection (`.select()`), pagination with `limit/skip` or cursor based.
- Indexes: compound indexes for frequent filters (user + createdAt).
- Caching layer (Redis) for feed or trending posts (future).
Frontend:
- Code splitting (Vite dynamic import) for heavy routes (Chat, Post detail).
- Memoization of expensive derived lists.
- Debounce search requests.
Media:
- Serve correct sizes from Cloudinary (transformations) to reduce payload.
Realtime:
- Consider message batching (send arrays every X ms) when scale increases.

## Phase 12: Deployment & Ops Strategy
Environments:
- Dev: local DB + unminified assets.
- Staging: seeded dataset, feature flags.
- Production: scaled DB cluster, monitoring + backups.
Secrets Management:
- Store .env outside version control, use vault or platform secret manager in prod.
Ops Checklist:
- SSL termination & WebSocket upgrade (Nginx or reverse proxy).
- Rolling restarts (PM2 or containers) without dropping socket rooms (sticky sessions or shared adapter).
- Backup strategy: daily DB snapshots.
- Observability: log volume, error rate, latency dashboards.

## Phase 13: Continuous Improvement & Roadmap Hooks
Short Term Hooks:
- Add test coverage gradually (start with auth & posts).
- Add refresh token & logout all sessions feature.
- Story TTL job (cron) + metrics.
Medium Term:
- Recommendation feed (signals: follow graph, engagement counts).
- i18n scaffolding.
- Web push notifications.
Long Term:
- Split chat service if latency spikes.
- Add graph-based search (user interests).

## Phase 14: MERN Revision Cheat Sheet
Backend Core:
- Express app -> middleware order matters (security → parsing → auth → routes → errors).
- Mongoose models with lean queries when sending lists.
- Controllers kept thin: validate early, sanitize, operate, shape output.
Frontend Core:
- Context for cross-cutting; Zustand for domain slices.
- API abstraction prevents duplication & centralizes error strategy.
Security Pillars:
- Validate, sanitize, limit, hash, sign, monitor.
Theming Pillars:
- Semantic variables, override by attribute, no inline hex.
Realtime Pillars:
- Auth sockets, room scoping, event naming consistency, fallback planning.
Performance Pillars:
- Index queries, paginate, cache hotspots, optimize payloads, code split.
Deployment Pillars:
- Env segregation, secrets, logging, monitoring, backups.

## Phase 15: Daily Dev Ritual (Suggested)
1. Pull latest branch & run both servers.
2. Lint & fix before coding.
3. Implement feature slice (tests if available).
4. Manually verify dark mode / accessibility impacts.
5. Review logs for unexpected errors.
6. Commit with meaningful conventional message.
7. Push & open PR with checklist.

## Common Pitfalls & Preventative Notes
Pitfall: Hardcoded colors → Fix: use semantic variables from start.
Pitfall: Mixed business logic and transport logic → Fix: isolate in controllers.
Pitfall: Unvalidated request body → Fix: mandatory Joi middleware.
Pitfall: Token leakage in logs → Fix: never log raw Authorization header.
Pitfall: Socket spam → Fix: implement lightweight rate/throttle mechanism.
Pitfall: Bloated components → Fix: move state/side effects to store or hook.

## Suggested Next Enhancements
- Auto-generate model docs via a script reading Mongoose schemas.
- Integrate Vitest/Jest baseline tests.
- Add accessibility linting (axe script in dev mode).
- Introduce feature flags for experimental UI components.

## Personal Learning Reflection Template (Fill as you grow)
1. What concept did I struggle with today? ____________________________
2. How did I resolve it? _____________________________________________
3. What security hole did I patch or notice? __________________________
4. What performance improvement can I schedule? _____________________
5. Which part of MERN stack feels weakest now? _______________________
6. Next study topic (deep dive): ____________________________________

---
Maintainer: belal
Living Document: Update as architecture evolves.
Last Updated: (set on commit)
