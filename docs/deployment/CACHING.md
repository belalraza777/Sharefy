# Redis Caching Implementation

## Overview
Sharefy backend now includes Redis caching to improve performance and reduce database load. All major endpoints are cached with smart invalidation strategies.

**Note**: Sharefy also supports **Google OAuth authentication**. See [OAUTH.md](OAUTH.md) for setup instructions.

## Architecture

### Redis Configuration
- **Location**: `Backend/config/redis.js`
- **Client**: ioredis
- **Connection**: Configured via environment variables
- **Retry Strategy**: Exponential backoff (max 2 seconds)

### Cache Utilities
- **Location**: `Backend/utils/cache.js`
- **Functions**:
  - `getCache(key)` - Retrieve cached data
  - `setCache(key, value, ttl)` - Store data with TTL
  - `deleteCache(key)` - Remove single cache entry
  - `deleteCachePattern(pattern)` - Remove multiple keys by pattern

## Cached Endpoints

### Feed & Posts
- **getFeed** - Cache key: `feed:{userId}:{page}`, TTL: 3 minutes
- **getPostById** - Cache key: `post:{postId}`, TTL: 5 minutes
- Invalidated on: Post create/delete, like/unlike, comments

### User Profiles
- **getUserProfile** - Cache key: `profile:{username}`, TTL: 5 minutes
- **getFollowers** - Cache key: `followers:{userId}`, TTL: 5 minutes
- **getFollowing** - Cache key: `following:{userId}`, TTL: 5 minutes (also used internally)
- Invalidated on: Profile update, follow/unfollow

### Search & Discovery
- **search** - Cache key: `search:{query}`, TTL: 30 minutes
- **getDiscoverPosts** - Cache key: `discover:{userId}:{page}`, TTL: 10 minutes
- **getSuggestedUsers** - Cache key: `suggested:{userId}`, TTL: 30 minutes

### Stories
- **getAllStories** - Cache key: `stories:{userId}`, TTL: 5 minutes
- **getUserStories** - Cache key: `userstories:{userId}:{viewerId}`, TTL: 5 minutes
- Invalidated on: Story create/delete, view

### Notifications & Saved Posts
- **getNotifications** - Cache key: `notifications:{userId}`, TTL: 1 minute
- **getSavedPosts** - Cache key: `saved:{userId}`, TTL: 10 minutes
- Invalidated on: New notification, mark as read, save/unsave

## Cache Invalidation Strategy

### Pattern-Based Invalidation
Used when multiple cache keys need to be cleared:
```javascript
await deleteCachePattern(`feed:*`); // Invalidate all feeds
await deleteCachePattern(`feed:{userId}:*`); // Invalidate user's feed pages
```

### Exact Key Deletion
Used for specific cache entries:
```javascript
await deleteCache(`profile:{username}`);
await deleteCache(`post:{postId}`);
```

### Trigger Points
- **Post created** → Invalidate all feeds
- **Post deleted** → Invalidate feeds + post cache
- **Follow/Unfollow** → Invalidate following list, profiles, feeds
- **Profile updated** → Invalidate profile cache
- **Comment added** → Invalidate post cache
- **Story created** → Invalidate all story feeds
- **Story viewed** → Invalidate story caches

## Rate Limiting with Redis

### Configuration
- **Location**: `Backend/middlewares/rateLimit.js`
- **Store**: rate-limit-redis
- **Benefits**: 
  - Persistent across restarts
  - Distributed rate limiting (multiple instances)
  - Centralized tracking

### Rate Limiters
- **globalLimiter**: 400 requests/minute per IP
- **authLimiter**: 5 requests/15 minutes per IP
- **postLimiter**: 20 posts/hour per IP
- **otpLimiter**: 5 OTP requests/15 minutes per IP

## Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_USERNAME=
```

## Performance Impact

### Expected Improvements
- **Feed queries**: 60-80% reduction in DB load
- **Profile queries**: 70-90% reduction
- **Search queries**: 80-95% reduction (regex queries)
- **Discover queries**: 40-50% reduction

### Cache Hit Rates (Target)
- Feed: 70-80%
- Profiles: 80-90%
- Search: 85-95%
- Stories: 60-70%

## Testing

### Test Redis Connection
```bash
cd Backend
node test-redis.js
```

### Monitor Cache Performance
Check Redis logs for:
- ✅ Cache HIT messages
- ❌ Cache MISS messages
- Connection status

## Deployment Notes

### Redis Instance
- **Development**: Local Redis or Docker
- **Production**: Redis Cloud, AWS ElastiCache, Upstash

### Docker Command (Local Testing)
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### Monitoring
- Track cache hit/miss rates
- Monitor Redis memory usage
- Alert on Redis downtime
- Log cache invalidation events

## Troubleshooting

### Redis Connection Issues
- Check REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env
- Verify Redis server is running
- Check firewall rules for port 6379
- For Redis Cloud, ensure no TLS mismatch

### Cache Not Working
- Verify Redis connection established (check logs)
- Check cache keys are being set correctly
- Confirm TTL values are appropriate
- Validate cache invalidation triggers

### Performance Issues
- Monitor cache memory usage (avoid evictions)
- Adjust TTL values based on data change frequency
- Consider Redis maxmemory policy (allkeys-lru recommended)

## Future Improvements

### Potential Enhancements
- [ ] Cache warming for active users
- [ ] Cache stampede prevention (locking)
- [ ] Advanced cache metrics dashboard
- [ ] Redis Cluster for high availability
- [ ] Selective cache prefetching
- [ ] Cache compression for large objects

### Monitoring & Observability
- [ ] Implement cache hit/miss tracking
- [ ] Add Redis health checks
- [ ] Create performance dashboards
- [ ] Set up alerting for cache failures
- [ ] Track latency improvements

## Related Files

### Configuration
- `Backend/config/redis.js` - Redis client setup
- `Backend/config/database.js` - MongoDB connection
- `Backend/.env.example` - Environment variables template

### Utilities
- `Backend/utils/cache.js` - Cache helper functions
- `Backend/test-redis.js` - Redis connection test script

### Controllers (All Cached)
- `Backend/controllers/postController.js`
- `Backend/controllers/userController.js`
- `Backend/controllers/searchController.js`
- `Backend/controllers/discoverController.js`
- `Backend/controllers/commentController.js`
- `Backend/controllers/notificationController.js`
- `Backend/controllers/savedPostController.js`
- `Backend/controllers/storyController.js`

### Middleware
- `Backend/middlewares/rateLimit.js` - Redis-backed rate limiting
