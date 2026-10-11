<div align="center">

# Sharefy

### A Modern Full-Stack Social Media Platform

[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Redis](https://img.shields.io/badge/Redis-ioredis-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**Share moments. Connect with people. Discover stories.**

Sharefy is a feature-rich, Instagram-inspired social platform built with the MERN stack, real-time communication, Redis caching, and a responsive mobile-first UI.

---

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Environment Variables](#-environment-variables) · [Deployment](#-deployment) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### Core Social Features
- **Post Creation** — Upload images & videos with captions (drag-and-drop, 10 MB limit)
- **Feed** — Pull-model feed with infinite scroll from followed users
- **Like & Comment** — Engage with posts in real time
- **Follow System** — Follow/unfollow users with follower & following lists
- **User Profiles** — Customizable bio, profile picture, and post grid
- **Stories** — 24-hour ephemeral stories with view tracking & auto-expiry (MongoDB TTL)
- **Saved Posts** — Bookmark posts to a personal collection
- **Discover** — Explore posts and suggested users outside your circle

### Communication
- **Real-time Chat** — 1:1 messaging powered by Socket.IO with online presence indicators
- **Live Notifications** — Instant notifications for likes, comments, follows, and new posts
- **Browser Notifications** — Native push notifications via the Notification API

### Authentication & Security
- **Email/Password** with bcrypt hashing
- **Google OAuth 2.0** via Passport.js
- **OTP Passwordless Login** — Email-based 6-digit OTP (TOTP via otplib)
- **JWT Authentication** — HttpOnly cookies (primary) + Bearer token (fallback)
- **Rate Limiting** — 4-tier Redis-backed rate limiting (global, auth, post, OTP)
- **Input Sanitization** — Joi validation + sanitize-html to prevent XSS
- **Helmet.js** — Secure HTTP headers

### Performance & UX
- **Redis Caching** — Smart caching with TTL on all major endpoints
- **Cloudinary CDN** — Auto-optimized media delivery (`f_auto, q_auto, w_600`)
- **Code Splitting** — React.lazy with skeleton fallbacks for secondary pages
- **Optimized Bundles** — Vite manual chunks (react, ui, state, socket vendors)
- **Dark/Light/System Theme** — Persisted user preference with CSS variables
- **Responsive Design** — Desktop 3-column → tablet 2-column → mobile single-column + bottom nav
- **Skeleton Loaders** — Smooth loading states for posts, profiles, and stories
- **Installable PWA** — Add Sharefy to a device home screen with automatic service-worker updates

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Express 5** | REST API framework |
| **MongoDB + Mongoose 8** | Database & ODM |
| **Redis (ioredis)** | Caching, rate limit store |
| **Socket.IO 4.8** | Real-time WebSocket server |
| **Cloudinary** | Media storage & CDN (custom Multer stream engine) |
| **Passport.js** | Google OAuth 2.0 strategy |
| **Mailgun / SendGrid** | Transactional email (OTP delivery) |
| **Joi** | Request validation with custom sanitize-html extension |
| **Helmet** | HTTP security headers |
| **Morgan** | HTTP request logging |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **React Router 7** | Client-side routing |
| **Zustand 5** | Lightweight state management (9 stores) |
| **Axios** | HTTP client with auth interceptors |
| **Socket.IO Client** | Real-time event handling |
| **Vite 7** | Build tool & dev server |
| **vite-plugin-pwa** | Web app manifest, installability, and service worker |
| **Sonner** | Toast notifications |
| **React Icons** | Icon library (Feather icons) |
| **React Infinite Scroll** | Infinite pagination |

---

## 🏗 Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        Frontend (React 19)                     │
│  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Pages   │  │ Zustand  │  │ Contexts │  │ Socket.IO     │  │
│  │  (Lazy)  │  │ 9 Stores │  │ Auth/Theme│ │ Client        │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │              │             │                │          │
│       └──────────────┴─────────────┴────────────────┘          │
│                  Axios (withCredentials + Bearer)               │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────┴──────────────────────────────────┐
│                     Backend (Express 5)                        │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Routes  │  │Controllers│  │Middleware │  │  Socket.IO   │  │
│  │ 11 routes│  │ 11 ctrl   │  │Auth/Rate/ │  │  Server      │  │
│  │          │  │           │  │Validate   │  │  (JWT auth)  │  │
│  └────┬─────┘  └────┬──────┘  └─────┬────┘  └──────┬───────┘  │
│       └──────────────┴───────────────┘              │          │
│                       │                             │          │
│           ┌───────────┴────────────┐                │          │
│           ▼                        ▼                ▼          │
│    ┌────────────┐          ┌────────────┐   ┌────────────┐    │
│    │  MongoDB   │          │   Redis    │   │ Cloudinary │    │
│    │ 11 Models  │          │  Cache +   │   │   Media    │    │
│    │ TTL Indexes│          │ Rate Limit │   │  Storage   │    │
│    └────────────┘          └────────────┘   └────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### Real-time Event Flow

```
Post Like → Controller creates Notification in DB
                 ↓
         Socket.IO emits "new_notification" to receiver
                 ↓
         Frontend notificationStore.addNotification()
                 ↓
         Toast + audio alert + badge update
```

### Caching Strategy

| Resource | TTL | Invalidation Trigger |
|----------|-----|---------------------|
| User Profile | 5 min | Profile update, follow/unfollow |
| Single Post | 5 min | Like, unlike, comment, delete |
| Search Results | 30 min | — (time-based expiry) |
| Discover Posts | 10 min | — (time-based expiry) |
| Suggested Users | 30 min | — (time-based expiry) |
| Notifications | 1 min | New notification, mark as read |
| Saved Posts | 10 min | Save/unsave |
| Stories | 5 min | Create, delete, view |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud like Upstash/Redis Cloud)
- **Cloudinary** account (free tier works)
- **Mailgun** or **SendGrid** account (for OTP emails)
- **Google Cloud Console** project (for OAuth — optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sharefy.git
cd sharefy
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000/api/v1

# Database
MONGODB_URL=mongodb://localhost:27017/sharefy

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# Auth
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Mailgun)
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_mailgun_domain

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend:

```bash
npm run dev    # Development (nodemon)
npm start      # Production
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev       # Development (Vite)
npm run build     # Production build
npm run preview   # Preview production build
```

### 4. Open the App

Navigate to **http://localhost:5173** — you're all set!

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require a valid JWT (cookie or Bearer token).

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Create a new account |
| `POST` | `/auth/login` | — | Login with email & password |
| `GET` | `/auth/logout` | — | Clear session cookie |
| `GET` | `/auth/check` | — | Verify current auth status |
| `PATCH` | `/auth/reset` | ✅ | Change password |
| `POST` | `/auth/request-otp` | — | Request OTP via email |
| `POST` | `/auth/verify-otp` | — | Verify OTP & get token |
| `GET` | `/auth/google` | — | Start Google OAuth flow |
| `GET` | `/auth/google/callback` | — | OAuth callback handler |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/posts/feed?page=1` | ✅ | Get feed (paginated) |
| `POST` | `/posts` | ✅ | Create post (multipart) |
| `GET` | `/posts/:id` | ✅ | Get single post |
| `POST` | `/posts/:id/like` | ✅ | Like a post |
| `POST` | `/posts/:id/unlike` | ✅ | Unlike a post |
| `DELETE` | `/posts/:id` | ✅ | Delete own post |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/:username` | ✅ | Get user profile |
| `PATCH` | `/users` | ✅ | Update profile info |
| `POST` | `/users/profile` | ✅ | Upload profile picture |
| `POST` | `/users/:id/follow` | ✅ | Follow a user |
| `POST` | `/users/:id/unfollow` | ✅ | Unfollow a user |
| `GET` | `/users/:id/followers` | ✅ | List followers |
| `GET` | `/users/:id/following` | ✅ | List following |

### Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/chat/send/:userId` | ✅ | Send a message |
| `GET` | `/chat/get/:userId` | ✅ | Get conversation messages |
| `GET` | `/chat/users` | ✅ | List chat conversations |

### Stories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/stories` | ✅ | Create a story (multipart) |
| `GET` | `/stories` | ✅ | Get all stories from followed users |
| `GET` | `/stories/user/:userId` | ✅ | Get user's stories |
| `POST` | `/stories/:id/view` | ✅ | Mark story as viewed |
| `DELETE` | `/stories/:id` | ✅ | Delete own story |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/comments/:postId` | ✅ | Add a comment |
| `DELETE` | `/comments/:postId/:commentId` | ✅ | Delete own comment |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | ✅ | Get all notifications |
| `PATCH` | `/notifications/read-all` | ✅ | Mark all as read |
| `PATCH` | `/notifications/:id/read` | ✅ | Mark one as read |

### Saved Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/saved-posts` | ✅ | Get saved posts |
| `POST` | `/saved-posts/:id/save` | ✅ | Save a post |
| `DELETE` | `/saved-posts/:id/save` | ✅ | Unsave a post |

### Search & Discover

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/search?query=` | ✅ | Search users by username/name |
| `GET` | `/discover/posts?page=1` | ✅ | Discover new posts |
| `GET` | `/discover/users?limit=20` | ✅ | Suggested users to follow |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Server status, uptime, timestamp |

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `8000`) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | Yes | Frontend origin for CORS |
| `BACKEND_URL` | Yes | Backend base URL (for OAuth callbacks) |
| `MONGODB_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `REDIS_HOST` | Yes | Redis server host |
| `REDIS_PORT` | Yes | Redis server port |
| `REDIS_USERNAME` | No | Redis username (if ACL enabled) |
| `REDIS_PASSWORD` | No | Redis password |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `MAILGUN_API_KEY` | Yes | Mailgun API key (for OTP emails) |
| `MAILGUN_DOMAIN` | Yes | Mailgun sending domain |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL |
| `VITE_SOCKET_URL` | No | Socket.IO server URL (defaults to API URL) |

---

## 🌐 Deployment

### Backend (Render / Railway / VPS)

1. Set all environment variables from the table above
2. Set `NODE_ENV=production`
3. Set `FRONTEND_URL` to your deployed frontend URL
4. Build command: `npm install`
5. Start command: `node -r dotenv/config index.js`

### Frontend (Vercel)

The project includes a `vercel.json` with SPA rewrite rules.

1. Connect your GitHub repository to Vercel
2. Set root directory to `Frontend`
3. Set environment variables: `VITE_API_URL`, `VITE_SOCKET_URL`
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`

---

## 📁 Project Structure

```
sharefy/
├── Backend/
│   ├── server.js              # HTTP server + Socket.IO init
│   ├── app.js                 # Express app setup, middleware, routes
│   ├── socket.js              # Socket.IO server (auth, presence, events)
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   ├── passport.js        # Google OAuth strategy
│   │   └── redis.js           # Redis client with retry strategy
│   ├── controllers/           # Business logic (11 controllers)
│   ├── middlewares/
│   │   ├── verifyAuth.js      # JWT authentication guard
│   │   ├── joiValidation.js   # Request validation + XSS sanitization
│   │   ├── rateLimit.js       # Redis-backed rate limiters (4 tiers)
│   │   ├── sanitizer.js       # HTML sanitization helpers
│   │   ├── uploadMiddleware.js # Multer + Cloudinary stream upload
│   │   └── errorClass.js      # Custom error class
│   ├── models/                # Mongoose schemas (11 models)
│   ├── routes/                # Express route definitions (11 routes)
│   └── utils/
│       ├── asyncWrapper.js    # Async error boundary for routes
│       ├── cache.js           # Redis get/set/delete/pattern-delete
│       ├── cloudinary.js      # Cloudinary SDK + custom Multer engine
│       ├── email.js           # Mailgun email service
│       └── otp.js             # TOTP-based OTP generation
│
├── Frontend/
│   ├── index.html             # App entry point
│   ├── vite.config.js         # Vite config (manual chunks, dev server)
│   ├── vercel.json            # Vercel SPA rewrite rules
│   └── src/
│       ├── App.jsx            # Root component (theme + layout + routes)
│       ├── main.jsx           # React mount + global styles
│       ├── socket.js          # Socket.IO client (connect/disconnect)
│       ├── api/               # Axios API modules (10 modules)
│       ├── store/             # Zustand stores (9 stores)
│       ├── context/
│       │   ├── authContext.jsx # Auth state + socket lifecycle
│       │   └── themeContext.jsx# Theme preference (light/dark/system)
│       ├── routes/
│       │   ├── AppRoute.jsx   # Route definitions + lazy loading
│       │   ├── ProtectedRoute.jsx # Auth guard redirect
│       │   └── ScrollToTop.jsx
│       ├── pages/             # 14 page modules
│       │   ├── Auth/          #   Login + Signup
│       │   ├── Feed/          #   Home feed with stories
│       │   ├── Chat/          #   1:1 messaging
│       │   ├── Post/          #   Single post view
│       │   ├── New_Post/      #   Create post (drag & drop)
│       │   ├── User_Profile/  #   User profile page
│       │   ├── Notification/  #   Notification center
│       │   ├── Search/        #   User search
│       │   ├── Explore/       #   Discover content
│       │   ├── SavedPost/     #   Saved posts collection
│       │   ├── Settings/      #   App settings (4 tabs)
│       │   ├── Theme/         #   Theme selector
│       │   └── oauth/         #   OAuth success handler
│       ├── components/        # Reusable UI components
│       │   ├── Layout/        #   Header, Sidebars, MobileNav
│       │   ├── Buttons/       #   Like, Follow, Save, Share, Delete
│       │   ├── chat/          #   ConversationList, MessageThread
│       │   ├── Story/         #   StoryCircles, StoryViewer, CreateStory
│       │   ├── post/          #   PostOptionsMenu
│       │   ├── search/        #   SearchBar, UserSearchResult
│       │   ├── Discover/      #   SuggestedUsers, SuggestedPosts
│       │   ├── Skeleton/      #   Loading skeletons
│       │   ├── settings/      #   Settings tab panels
│       │   └── user/          #   Profile forms
│       ├── helper/
│       │   └── getOptimizedUrl.js  # Cloudinary URL transform
│       ├── styles/            # Global CSS (index, responsive, animations)
│       └── assets/            # Static assets (logo, images)
│
└── docs/
    └── deployment/
        ├── CACHING.md         # Redis caching documentation
        └── OAUTH.md           # Google OAuth setup guide
```

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `connection` | `auth: { token }` | Authenticate socket with JWT |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `onlineUsers` | `userId[]` | Online presence broadcast |
| `newMessage` | `{ senderId, message, ... }` | New chat message received |
| `new_notification` | `{ sender, message, ... }` | Like, comment, follow, or new post alert |

---

## 📊 Database Models

| Model | Key Features |
|-------|-------------|
| **User** | Unique username & email, bcrypt hash, Google OAuth provider support, virtual followers/following |
| **Post** | Media (image/video) with Cloudinary publicId, likes array, populated comments, compound indexes |
| **Comment** | Post-delete hook removes reference from parent post |
| **Follow** | Unique compound index `(follower, following)` prevents duplicates |
| **Conversation** | 1:1 chat tracking with member refs and message refs |
| **Message** | Sender/receiver indexed for efficient inbox queries |
| **Notification** | Indexed on `(receiver, isRead, createdAt)` for fast unread queries |
| **Story** | **TTL index** — Auto-deletes after 24 hours, Mongoose hooks for Cloudinary cleanup |
| **SavedPost** | Unique compound index `(user, post)` prevents duplicate saves |
| **OTP** | **TTL index** — Auto-deletes expired codes, bcrypt-hashed OTP storage |
| **Feed** | Push-model schema (capped at 500 posts) — reserved for future use |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ by [Belal](https://github.com/your-username)**

</div>