import User from '../models/userModel.js';

// @desc    Autocomplete search for users (typeahead)
// @route   GET /api/search/
export const search = async (req, res) => {
    // Get the 'query' parameter from the URL, e.g., /api/search/autocomplete?query=j
    const { query } = req.query;

    // If no query is provided, return a 400 Bad Request
    if (!query) {
        return res.status(400).json({
            success: false,
            message: 'Query is required',
        });
    }
    // Search users where username OR fullName starts with the query (case-insensitive)
    // '^' in regex ensures it matches the **start of the string**
    // $options: 'i' makes it case-insensitive
    const users = await User.find({
        $or: [
            { username: { $regex: `^${query}`, $options: 'i' } },
            { fullName: { $regex: `^${query}`, $options: 'i' } },
        ],
    })
        .select('_id username profileImage')
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
