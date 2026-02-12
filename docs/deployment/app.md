# Sharefy — React → React Native Conversion Plan

## 1. Current App Overview

| Layer | Tech | Files |
|-------|------|-------|
| **Framework** | React 19 + Vite | JSX components |
| **Routing** | react-router-dom v7 | 14 routes (login, signup, feed, profile, chat, etc.) |
| **State** | Zustand (9 stores) + Context (auth, theme) | `store/*.js`, `context/*.jsx` |
| **API** | Axios (10 api modules) | `api/*.js` |
| **Real-time** | Socket.IO client | `socket.js` |
| **Styling** | Raw CSS (38+ files) + CSS variables | No Tailwind classes in components |
| **Media** | Cloudinary (image optimization helper) | `helper/getOptimizedUrl.js` |
| **Toasts** | Sonner | Throughout app |
| **Icons** | react-icons | Throughout app |
| **Misc** | Infinite scroll, debounce, lazy loading | Various |

### Screens / Routes
```
/login              →  LoginScreen
/signup             →  SignupScreen
/                   →  FeedScreen (stories + posts)
/post/:postId       →  SinglePostScreen
/new-post           →  CreatePostScreen
/profile/:username  →  ProfileScreen
/notifications      →  NotificationScreen
/settings           →  SettingsScreen
/explore            →  ExploreScreen
/reset-password     →  ResetPasswordScreen
/saved              →  SavedPostScreen
/search             →  SearchScreen
/chat               →  ChatListScreen
/chat/:userId       →  ChatThreadScreen
/theme              →  ThemeScreen
/oauth-success      →  OAuthSuccessScreen
```

---

## 2. Target Stack

| Concern | React Native Choice |
|---------|---------------------|
| **Init** | Expo SDK 52+ (managed workflow) |
| **Navigation** | `@react-navigation/native` (stack + bottom-tabs) |
| **State** | Zustand (reuse as-is) |
| **API** | Axios (reuse as-is) |
| **Real-time** | Socket.IO client (reuse as-is) |
| **Storage** | `expo-secure-store` (token) + `@react-native-async-storage/async-storage` (user, prefs) |
| **Styling** | React Native `StyleSheet` + `nativewind` (optional) |
| **Images** | `expo-image` (fast cached loading) + Cloudinary helper (reuse) |
| **Camera/Gallery** | `expo-image-picker` |
| **Video** | `expo-av` |
| **Toasts** | `react-native-toast-message` |
| **Icons** | `@expo/vector-icons` or `react-native-vector-icons` |
| **Theming** | React Context (reuse) + `useColorScheme()` |
| **Auth (OAuth)** | `expo-auth-session` + `expo-web-browser` |
| **Push Notifs** | `expo-notifications` |
| **Animations** | `react-native-reanimated` |

---

## 3. What Can Be Reused (No/Minimal Changes)

These files contain **zero DOM/CSS** and transfer directly:

| Layer | Files | Changes Needed |
|-------|-------|----------------|
| Zustand stores | `store/*.js` (9 files) | **None** — pure JS logic |
| API modules | `api/*.js` (10 files) | **None** — Axios works in RN |
| Auth context | `context/authContext.jsx` | Replace `localStorage` → `SecureStore` / `AsyncStorage` |
| Theme context | `context/themeContext.jsx` | Replace `localStorage` → `AsyncStorage`, add `useColorScheme()` |
| Socket client | `socket.js` | Replace `Audio()` → `expo-av`, remove `Notification` browser API, replace `import.meta.env` → `expo-constants` |
| Cloudinary helper | `helper/getOptimizedUrl.js` | **None** |

**~30+ files reusable = ~40% of frontend codebase**

---

## 4. What Must Be Rewritten

### 4.1 All CSS → StyleSheet
Every `.css` file (38+) must be converted to `StyleSheet.create()` objects colocated in each component.

**Key mapping:**
```
CSS                          →  React Native
─────────────────────────────────────────────
div                          →  View
p, span, h1-h6               →  Text
img                          →  Image (expo-image)
input                        →  TextInput
button                       →  Pressable / TouchableOpacity
a (Link)                     →  Pressable + navigation.navigate()
ul/li                        →  FlatList / ScrollView
overflow-y: auto             →  ScrollView / FlatList
display: grid                →  flexbox (RN only has flex)
position: fixed              →  position: absolute + SafeAreaView
backdrop-filter              →  expo-blur (BlurView)
CSS variables                →  JS theme object
media queries                →  useWindowDimensions() / Platform
border-radius: 50%           →  borderRadius: 9999
@keyframes                   →  Reanimated / Animated API
:hover                       →  Not applicable (remove)
```

### 4.2 Navigation (react-router-dom → React Navigation)

```
React Router                 →  React Navigation
──────────────────────────────────────────────
<BrowserRouter>              →  <NavigationContainer>
<Routes>/<Route>             →  Stack.Navigator + Stack.Screen
<Link to="/x">               →  navigation.navigate('X')
useNavigate()                →  useNavigation()
useParams()                  →  route.params
useLocation()                →  useRoute()
<Navigate to="/login" />     →  CommonActions.reset() or redirect in auth flow
Lazy loading                 →  Not needed (RN bundles differently)
ScrollToTop                  →  Not needed (each screen scrolls independently)
```

**Navigation structure:**
```
RootStack (Stack.Navigator)
├── AuthStack (unauthenticated)
│   ├── LoginScreen
│   ├── SignupScreen
│   └── OAuthSuccessScreen
│
└── MainTabs (Tab.Navigator — Bottom tabs)
    ├── FeedTab (Stack)
    │   ├── FeedScreen
    │   ├── SinglePostScreen
    │   └── ProfileScreen
    ├── SearchTab (Stack)
    │   ├── SearchScreen
    │   └── ExploreScreen
    ├── CreatePostScreen (modal)
    ├── NotificationTab (Stack)
    │   └── NotificationScreen
    └── ProfileTab (Stack)
        ├── ProfileScreen (own)
        ├── SettingsScreen
        ├── ThemeScreen
        ├── ResetPasswordScreen
        └── SavedPostScreen

ChatStack (presented as modal over MainTabs)
├── ChatListScreen
└── ChatThreadScreen
```

### 4.3 Component Rewrites (by priority)

| Priority | Component | Key Changes |
|----------|-----------|-------------|
| **P0** | `Layout.jsx` | Remove entirely — replaced by React Navigation tabs + header |
| **P0** | `Header.jsx` | → custom header in each Stack.Navigator `screenOptions` |
| **P0** | `LeftSidebar.jsx` | → Bottom Tab Navigator |
| **P0** | `MobileBottomNav.jsx` | → Bottom Tab Navigator (merge) |
| **P0** | `RightSidebar.jsx` | → Separate ExploreScreen or drawer |
| **P1** | Feed components | `FlatList` with pull-to-refresh, `onEndReached` for infinite scroll |
| **P1** | Post card (`post.css` components) | Full rewrite with `View/Text/Image/Pressable` |
| **P1** | Story components | Horizontal `FlatList`, full-screen Story viewer with `expo-av` |
| **P1** | Chat (ConversationList, MessageThread, MessageComposer) | `FlatList` inverted for messages, `KeyboardAvoidingView` |
| **P2** | Auth pages (login, signup) | `TextInput` + `KeyboardAvoidingView` |
| **P2** | CreatePost | `expo-image-picker`, `TextInput`, submit via existing API |
| **P2** | Profile page | Rewrite grid with `FlatList` numColumns={3} |
| **P2** | Search / SearchBar | `TextInput` with debounce, `FlatList` for results |
| **P3** | Notifications | `FlatList` + push notification integration |
| **P3** | Settings / Theme | Simple form screens |
| **P3** | SavedPosts | Grid with `FlatList` numColumns={3} |
| **P3** | Comments (SinglePost) | Nested `FlatList` or `SectionList` |

---

## 5. Platform-Specific Replacements

| Web API | React Native Replacement |
|---------|--------------------------|
| `localStorage` | `expo-secure-store` (tokens), `AsyncStorage` (prefs/user) |
| `window.matchMedia` | `useColorScheme()` from `react-native` |
| `new Audio()` | `Audio` from `expo-av` |
| `Notification` (browser push) | `expo-notifications` |
| `navigator.clipboard` | `expo-clipboard` |
| `navigator.share` | `expo-sharing` or `react-native-share` |
| `<input type="file">` | `expo-image-picker` |
| `URL.createObjectURL()` | Local file URI from image picker |
| `import.meta.env` | `expo-constants` → `Constants.expoConfig.extra` |
| `window.innerWidth` | `useWindowDimensions()` |
| `document.title` | Not applicable |
| `<video>` / `<audio>` | `expo-av` (`Video`, `Audio`) |
| CSS `@keyframes` | `react-native-reanimated` |
| Infinite scroll component | `FlatList` `onEndReached` + `onEndReachedThreshold` |
| `sonner` toasts | `react-native-toast-message` |
| `react-icons` | `@expo/vector-icons` (Ionicons, MaterialIcons, etc.) |
| OAuth redirect (browser) | `expo-auth-session` + `expo-web-browser` |

---

## 6. Project Structure (React Native)

```
SharefyApp/
├── app.json                    # Expo config
├── App.jsx                     # Entry: providers + NavigationContainer
├── babel.config.js
├── package.json
│
├── src/
│   ├── api/                    # ✅ Reuse as-is (10 files)
│   ├── store/                  # ✅ Reuse as-is (9 files)
│   ├── context/
│   │   ├── authContext.jsx     # 🔧 Adapt (SecureStore)
│   │   └── themeContext.jsx    # 🔧 Adapt (AsyncStorage)
│   ├── socket.js               # 🔧 Adapt (expo-av, constants)
│   ├── helper/
│   │   └── getOptimizedUrl.js  # ✅ Reuse as-is
│   │
│   ├── navigation/
│   │   ├── RootNavigator.jsx   # 🆕 Auth check → AuthStack or MainTabs
│   │   ├── AuthStack.jsx       # 🆕
│   │   ├── MainTabs.jsx        # 🆕 Bottom tab navigator
│   │   ├── FeedStack.jsx       # 🆕
│   │   ├── SearchStack.jsx     # 🆕
│   │   ├── NotificationStack.jsx # 🆕
│   │   ├── ProfileStack.jsx    # 🆕
│   │   └── ChatStack.jsx       # 🆕 Modal stack
│   │
│   ├── screens/                # 🆕 All screens rewritten
│   │   ├── Auth/
│   │   │   ├── LoginScreen.jsx
│   │   │   └── SignupScreen.jsx
│   │   ├── Feed/
│   │   │   └── FeedScreen.jsx
│   │   ├── Post/
│   │   │   ├── SinglePostScreen.jsx
│   │   │   └── CreatePostScreen.jsx
│   │   ├── Profile/
│   │   │   └── ProfileScreen.jsx
│   │   ├── Chat/
│   │   │   ├── ChatListScreen.jsx
│   │   │   └── ChatThreadScreen.jsx
│   │   ├── Notification/
│   │   │   └── NotificationScreen.jsx
│   │   ├── Search/
│   │   │   └── SearchScreen.jsx
│   │   ├── Explore/
│   │   │   └── ExploreScreen.jsx
│   │   ├── Settings/
│   │   │   ├── SettingsScreen.jsx
│   │   │   ├── ThemeScreen.jsx
│   │   │   └── ResetPasswordScreen.jsx
│   │   └── SavedPost/
│   │       └── SavedPostScreen.jsx
│   │
│   ├── components/             # 🆕 All rewritten (no CSS, use StyleSheet)
│   │   ├── PostCard.jsx
│   │   ├── StoryBar.jsx
│   │   ├── StoryViewer.jsx
│   │   ├── CommentSection.jsx
│   │   ├── UserAvatar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FollowButton.jsx
│   │   ├── LikeButton.jsx
│   │   ├── SaveButton.jsx
│   │   ├── ShareButton.jsx
│   │   ├── SkeletonLoader.jsx
│   │   ├── EmptyState.jsx
│   │   └── LoadingSpinner.jsx
│   │
│   └── theme/                  # 🆕 Centralized theme constants
│       ├── colors.js           # Light + dark palettes (from CSS vars)
│       ├── spacing.js          # --space-xs to --space-3xl
│       ├── typography.js       # Font sizes, weights
│       └── shadows.js          # Shadow presets
```

---

## 7. Migration Phases

### Phase 1 — Scaffold & Core (Week 1-2)
- [ ] Init Expo project (`npx create-expo-app SharefyApp`)
- [ ] Install core deps (`@react-navigation`, `zustand`, `axios`, `socket.io-client`, `expo-secure-store`, `async-storage`)
- [ ] Copy `api/`, `store/`, `helper/` directly
- [ ] Adapt `authContext.jsx` (replace `localStorage` → SecureStore/AsyncStorage)
- [ ] Adapt `themeContext.jsx` (replace `localStorage` → AsyncStorage + `useColorScheme`)
- [ ] Adapt `socket.js` (remove browser APIs)
- [ ] Create `theme/` directory (extract CSS variables into JS)
- [ ] Build navigation structure (RootNavigator, AuthStack, MainTabs, sub-stacks)

### Phase 2 — Auth & Feed (Week 2-3)
- [ ] LoginScreen + SignupScreen (TextInput, KeyboardAvoidingView)
- [ ] FeedScreen with FlatList, pull-to-refresh, infinite scroll
- [ ] PostCard component (View/Text/Image/Pressable)
- [ ] StoryBar (horizontal FlatList) + StoryViewer (full-screen modal with expo-av)
- [ ] LikeButton, SaveButton, ShareButton, FollowButton
- [ ] CreatePostScreen (expo-image-picker + TextInput)
- [ ] Toast setup (react-native-toast-message)

### Phase 3 — Profile & Social (Week 3-4)
- [ ] ProfileScreen (header + FlatList numColumns={3} grid)
- [ ] SinglePostScreen (post + comments FlatList)
- [ ] NotificationScreen (FlatList + push notification registration)
- [ ] SearchScreen + ExploreScreen
- [ ] SavedPostScreen (grid)
- [ ] FollowButton integration across screens

### Phase 4 — Chat & Real-time (Week 4-5)
- [ ] ChatListScreen (FlatList of conversations)
- [ ] ChatThreadScreen (inverted FlatList + KeyboardAvoidingView + composer)
- [ ] Socket.IO integration (online status, real-time messages)
- [ ] Push notifications (expo-notifications for background messages)
- [ ] Notification sounds (expo-av)

### Phase 5 — Settings & Polish (Week 5-6)
- [ ] SettingsScreen (UpdateProfile, UpdateProfilePic via expo-image-picker)
- [ ] ResetPasswordScreen
- [ ] ThemeScreen (light/dark/system toggle)
- [ ] OAuth login flow (expo-auth-session)
- [ ] Loading skeletons + empty states
- [ ] Animations (react-native-reanimated for transitions)
- [ ] Error boundaries + offline handling

### Phase 6 — Testing & Launch (Week 6-7)
- [ ] Test on iOS simulator + Android emulator
- [ ] Test on physical devices (various screen sizes)
- [ ] Performance profiling (FlatList optimization, image caching)
- [ ] App icons + splash screen (expo config)
- [ ] EAS Build setup (`eas build`)
- [ ] App Store / Play Store submission prep

---

## 8. Key Gotchas to Watch

| Issue | Solution |
|-------|----------|
| **No CSS Grid in RN** | Use `FlatList numColumns` or nested flexbox |
| **No `position: fixed`** | Use `position: absolute` inside `SafeAreaView` |
| **No `overflow: auto` scroll** | Everything scrollable must be `ScrollView` or `FlatList` |
| **iOS keyboard covers input** | Wrap forms in `KeyboardAvoidingView` with `behavior="padding"` |
| **Android back button** | React Navigation handles this, but verify in ChatThread |
| **Image upload** | `expo-image-picker` returns local URI — send as `multipart/form-data` via Axios (same as web) |
| **Deep linking** | Configure `linking` config in `NavigationContainer` for `/post/:id`, `/profile/:username` |
| **Text must be in `<Text>`** | Every string, even a space, must be inside `<Text>` |
| **No `className` or CSS** | All styles via `StyleSheet.create()` or inline |
| **Env variables** | Use `app.config.js` `extra` field + `expo-constants`, not `import.meta.env` |
| **Token refresh** | Same Axios interceptor works, but store/retrieve from SecureStore |
| **Web notification API** | Replace with `expo-notifications` (requires physical device for push) |
| **`react-infinite-scroll-component`** | Replace with `FlatList` `onEndReached` |
| **`sonner` (toast)** | Replace with `react-native-toast-message` |
| **CSS `clamp()`** | Compute with `Math.min(Math.max(...))` or `useWindowDimensions()` |

---

## 9. Dependencies to Install

```bash
# Core
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State & Network
npm install zustand axios socket.io-client

# Storage
npx expo install expo-secure-store @react-native-async-storage/async-storage

# Media
npx expo install expo-image expo-image-picker expo-av expo-blur

# Notifications
npx expo install expo-notifications expo-device

# Auth
npx expo install expo-auth-session expo-web-browser expo-crypto

# UI
npm install react-native-toast-message
npx expo install @expo/vector-icons

# Animations
npx expo install react-native-reanimated react-native-gesture-handler

# Utils
npx expo install expo-clipboard expo-sharing expo-constants expo-linking
```

---

## 10. Effort Estimate

| Phase | Effort | Files |
|-------|--------|-------|
| Scaffold & Core | ~3 days | ~15 new/adapted |
| Auth & Feed | ~5 days | ~12 new |
| Profile & Social | ~5 days | ~10 new |
| Chat & Real-time | ~4 days | ~6 new |
| Settings & Polish | ~4 days | ~8 new |
| Testing & Launch | ~4 days | — |
| **Total** | **~25 days** | **~50 files new, ~5 adapted, ~30 reused** |

> The backend requires **zero changes** — all API endpoints, Socket.IO, auth, and Cloudinary work identically with a React Native client.
