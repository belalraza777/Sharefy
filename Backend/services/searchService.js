import User from '../models/userModel.js';
import { sanitize } from '../middlewares/sanitizer.js';
import { getCache, setCache } from '../utils/cache.js';

const searchService = async (query) => {
    // If no query is provided, return a 400 Bad Request
    if (!query) {
        throw Object.assign(new Error('Query is required'), { statusCode: 400 });
    }
    // Sanitize the query parameter to prevent XSS
    query = sanitize(query.toString()).trim();
    // Validate query length
    if (query.length < 1 || query.length > 50) {
        throw Object.assign(new Error('Query must be between 1 and 50 characters'), { statusCode: 400 });
    }
    // Check cache first
    const cacheKey = `search:${query.toLowerCase()}`;
    const cachedResults = await getCache(cacheKey);
    if (cachedResults) {
        return cachedResults;
    }
    // Escape special regex characters to prevent regex injection
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedQuery = escapeRegex(query);
    // Search users where username OR fullName starts with the query (case-insensitive)
    // '^' in regex ensures it matches the **start of the string**
    // $options: 'i' makes it case-insensitive
    const users = await User.find({
        $or: [
            { username: { $regex: `^${escapedQuery}`, $options: 'i' } },
            { fullName: { $regex: `^${escapedQuery}`, $options: 'i' } },
        ],
    })
        .select('_id username fullName profileImage')
        // Limit results to 10 to avoid sending too much data
        .limit(10)
        .lean();
    // Cache search results for 30 minutes
    await setCache(cacheKey, users, 1800);
    return users;
};

export default {
    searchService,
};