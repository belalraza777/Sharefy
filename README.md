# Sharefy

Sharefy is a social media app (React + Vite frontend, Node/Express + MongoDB backend) providing posts, stories, realtime chat and notifications with media uploads and email OTP.

---

## Quick links
- Backend entry: Backend/server.js  
- Frontend entry: Frontend/src/main.jsx  
- Socket helpers: Backend/socket.js  
- Story routes: Backend/routes/storyRoute.js  
- Notification controller: Backend/controllers/notificationController.js  
- Feed page: Frontend/src/pages/Feed/feed.jsx

(See project tree for full file list.)

---

## Features
- User authentication (email OTP + JWT + **Google OAuth**)
- Create, edit, delete posts (image/video)
- Stories (ephemeral media uploads)
- Realtime chat and presence via Socket.IO
- Real-time notifications (likes, comments, follows, messages)
- Follow / unfollow system and personalized feed
- Search & Discover (suggested users)
- Likes, comments, bookmarks
- Media uploads with Cloudinary (image/video optimization)
- Basic moderation & validation (Joi validators / sanitizers)
- Theme toggle (light/dark)
- **Redis caching for improved performance** (feed, profiles, search, stories)
- **Persistent rate limiting with Redis** (distributed across instances)
- API pagination and smart cache invalidation

---

## Technologies & Libraries
Backend
- Node.js, Express
- MongoDB + Mongoose
- **Redis (caching & rate limiting)**
- **ioredis (Redis client)**
- Socket.IO (server)
- Cloudinary SDK
- Mailgun (email OTP) or similar provider
- Joi (validation)
- jsonwebtoken, bcrypt (auth)
- **Passport.js + Google OAuth 2.0**
- dotenv (env management)
- rate-limit-redis (distributed rate limiting)

Frontend
- React + Vite
- React Router
- Axios (API)
- Socket.IO client
- State store using Zustand
- ESLint config and common dev tooling


---

---

## Getting Started

1. Clone the repo
    git clone <https://github.com/belalraza777/Sharefy.git>
2. Install dependencies
    - Backend: cd Backend && npm install
    - Frontend: cd Frontend && npm install
3. Environment
    - Copy .env.example to .env in both Backend and Frontend as needed.
    - Typical backend vars: PORT, MONGO_URI, JWT_SECRET, CLOUDINARY_URL, MAILGUN_API_KEY
    - **Redis vars**: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (for caching & rate limiting)
    - **OAuth vars**: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL (for Google OAuth)
4. Setup Google OAuth (Optional)
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create OAuth 2.0 credentials (Web application)
    - Add redirect URI: `http://localhost:5000/auth/google/callback`
    - Copy Client ID and Secret to `.env`
    - See [OAUTH.md](docs/deployment/OAUTH.md) for detailed setup
5. Setup Redis
    - **Local**: Install Redis locally or use Docker: `docker run -d -p 6379:6379 redis:alpine`
    - **Cloud**: Use Redis Cloud, Upstash, or AWS ElastiCache
    - Update .env with your Redis credentials
6. Run locally
    - Backend: npm run dev (or node server.js)
    - Frontend: npm run dev (Vite)
6. Optional
    - Seed database scripts (if provided) before first run.
    - Use ngrok or similar for testing webhooks/sockets across devices.
    - Test caching with `node Backend/test-redis.js`

---

## Contributing

- Open an issue to discuss major changes first.
- Fork -> feature branch -> pull request.
- Keep commits focused and add tests where applicable.
- Follow existing code style (ESLint + Prettier).

---

## License

MIT — see LICENSE file for details.

---

## Support

Create issues for bugs or feature requests. For quick help, reference important files listed in "Quick links".