import redisClient from "../config/redis.js";

// Get from cache
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null; // Return null if key doesn't exist or parse JSON to object
  } catch (error) {
    console.error(`Cache GET error:`, error.message);
    return null;
  }
};

// Set to cache with expiry TTL (seconds)
export const setCache = async (key, value, ttl = 300) => {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value)); // Store as JSON string with expiry TTL
    return true;
  } catch (error) {
    console.error(`Cache SET error:`, error.message);
    return false;
  }
};

// Delete cache key
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`Cache DELETE error:`, error.message);
    return false;
  }
};

// Delete multiple keys by pattern
// e.g., deleteCachePattern('user:*')
export const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return keys.length;
  } catch (error) {
    console.error(`Cache DELETE PATTERN error:`, error.message);
    return 0;
  }
};
