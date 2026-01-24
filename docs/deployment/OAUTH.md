# Google OAuth Implementation Guide

## Overview
Sharefy now supports Google OAuth authentication, providing users with a quick and secure sign-in option without needing to create a new password.

## Architecture

### Backend Setup

#### 1. Passport Configuration
- **Location**: `Backend/config/passport.js`
- **Strategy**: Google OAuth 2.0
- **Dependencies**: `passport`, `passport-google-oauth20`

```javascript
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    // Find or create user
}));
```

#### 2. OAuth Routes
- **Location**: `Backend/routes/oAuthRoute.js`
- **Endpoints**:
  - `GET /auth/google` - Initiates Google login flow
  - `GET /auth/google/callback` - Handles OAuth callback

#### 3. Authentication Flow
```
User clicks "Sign in with Google"
    ↓
Frontend redirects to `/auth/google`
    ↓
Google OAuth consent screen (user authorizes)
    ↓
Google redirects to `/auth/google/callback` with authorization code
    ↓
Backend exchanges code for user profile
    ↓
Backend finds or creates user in database
    ↓
Backend generates JWT token
    ↓
Backend sets HTTP-only cookie with token
    ↓
Backend redirects to `/oauth/success`
    ↓
Frontend's `oAuth-success.jsx` calls `refreshUser()`
    ↓
Frontend redirects to home (/)
```

### Frontend Implementation

#### 1. Login Page
- **Location**: `Frontend/src/pages/Auth/login.jsx`
- **Google Button**: Displays at top of login form
- **Link**: Points to `${VITE_API_URL}/auth/google`

#### 2. OAuth Success Handler
- **Location**: `Frontend/src/pages/oauth/oAuth-success.jsx`
- **Purpose**: Completes OAuth flow after backend callback
- **Actions**:
  - Calls `refreshUser()` from auth context
  - Syncs user data after OAuth authentication
  - Redirects to home on success or login on failure
  - Shows loading skeleton while processing

#### 3. Auth Context
- **Location**: `Frontend/src/context/authContext.jsx`
- **Function**: `refreshUser()` - Fetches authenticated user data after OAuth login

### Environment Variables

#### Backend (`Backend/.env`)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=http://localhost:5000  # or production URL

# Other required variables
JWT_SECRET=your_jwt_secret
DATABASE_URL=mongodb_connection_string
NODE_ENV=development
```

#### Frontend (`Frontend/.env.local`)
```env
VITE_API_URL=http://localhost:5000  # Backend URL
```

## Setup Instructions

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Sharefy")
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`, `https://yourdomain.com`
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`, `https://yourdomain.com/auth/google/callback`
5. Copy Client ID and Client Secret to backend `.env`

### 2. Backend Dependencies
```bash
npm install passport passport-google-oauth20
```

### 3. Verify Configuration
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- [ ] `BACKEND_URL` set correctly
- [ ] Google Cloud Console redirect URIs match backend URL
- [ ] `oAuthRoute.js` imported in `app.js`

### 4. Frontend Configuration
- [ ] `VITE_API_URL` environment variable set
- [ ] Google button visible on login page
- [ ] `oAuth-success.jsx` component present

## Security Considerations

### 1. HTTP-Only Cookies
- JWT tokens are stored in HTTP-only cookies, preventing XSS attacks
- Cookies are automatically sent with requests
- Set `secure: true` in production (HTTPS only)
- Set `sameSite: 'none'` for cross-domain requests in production

### 2. CORS Configuration
- Backend should whitelist frontend URL in CORS
- Google OAuth callback requires matching redirect URI

### 3. Cookie Settings
```javascript
res.cookie("token", token, {
    httpOnly: true,           // Prevents JavaScript access
    maxAge: 5 * 24 * 60 * 60 * 1000,  // 5 days
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
});
```

## Testing

### Local Development
1. Start backend: `cd Backend && npm start`
2. Start frontend: `cd Frontend && npm run dev`
3. Navigate to login page
4. Click "Sign in with Google"
5. Complete Google OAuth flow
6. Should redirect to home page with authenticated user

### Common Issues

**Issue**: "Cannot find module passport.js"
- **Solution**: Verify `oAuthRoute.js` imports from `../config/passport.js` (not `../auth/passport.js`)

**Issue**: OAuth callback fails with redirect URI mismatch
- **Solution**: Ensure `BACKEND_URL` matches Google Cloud Console redirect URI exactly

**Issue**: User profile not loading after OAuth
- **Solution**: Check `refreshUser()` in auth context and ensure API endpoint is accessible

**Issue**: Cookies not being set
- **Solution**: Verify `secure` and `sameSite` settings match your environment (development vs production)

## Production Deployment

### 1. Update Google Cloud Console
- Add production domain to authorized origins
- Add production redirect URI to authorized redirect URIs

### 2. Environment Variables
- Set `BACKEND_URL` to production backend domain
- Set `FRONTEND_URL` to production frontend domain
- Ensure `NODE_ENV=production` on backend

### 3. Cookie Security
- Set `secure: true` for HTTPS
- Verify `sameSite` setting matches your deployment architecture

### 4. CORS Headers
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
```

## Future Enhancements

- [ ] Support for additional OAuth providers (GitHub, Facebook)
- [ ] Automatic user profile image sync from Google
- [ ] Link existing accounts with OAuth
- [ ] Refresh token rotation for enhanced security

## References

- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [HTTP-Only Cookies Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
