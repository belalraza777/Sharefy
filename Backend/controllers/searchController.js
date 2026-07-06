import searchService from '../services/searchService.js';

// Autocomplete search for users (typeahead)
// GET /api/search/
export const search = async (req, res) => {
    // Get the 'query' parameter from the URL, e.g., /api/search/autocomplete?query=j
    const { query } = req.query;
    const users = await searchService.searchService(query);
    // Send the matching users as JSON response
    res.status(200).json({
        success: true,
        message: 'Users found',
        data: users,
    });
};