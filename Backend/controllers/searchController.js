import User from '../models/userModel.js';
import { sanitize } from '../middlewares/sanitizer.js';

// @desc    Autocomplete search for users (typeahead)
// @route   GET /api/search/
export const search = async (req, res) => {
    // Get the 'query' parameter from the URL, e.g., /api/search/autocomplete?query=j
    let { query } = req.query;

    // If no query is provided, return a 400 Bad Request
    if (!query) {
        return res.status(400).json({
            success: false,
            message: 'Query is required',
        });
    }

    // Sanitize the query parameter to prevent XSS
    query = sanitize(query.toString()).trim();
    
    // Validate query length
    if (query.length < 1 || query.length > 50) {
        return res.status(400).json({
            success: false,
            message: 'Query must be between 1 and 50 characters',
        });
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

    // Send the matching users as JSON response
    res.status(200).json({
        success: true,
        message: 'Users found',
        data: users
    });
};
