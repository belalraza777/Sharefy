import { useState } from 'react';
import useSearchStore from '../../store/searchStore';
import debounce from 'debounce';
import { Link } from 'react-router-dom';
import './SearchBar.css';

/**
 * SearchBar Component - Used for dropdown search in header/navigation
 * Shows instant results in a dropdown while typing
 */
const SearchBar = ({ isDropdown = true }) => {
    const [query, setQuery] = useState('');
    const { search, result, loading } = useSearchStore();

    // Debounced search function to avoid too many API calls
    // only after the user stops typing for a specified delay (800ms here).
    // This prevents making an API call on every single keystroke, 
    // improving performance and reducing server load.
    const debouncedSearch = debounce((value) => {
        if (value.length > 1) {
            search(value);
        }
    }, 800);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    // Only show results when there's a query
    const showResults = query.length > 0;
    

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search for users..."
                aria-label="Search users"
            />

            {/* Dropdown Results */}
            {(showResults && isDropdown) && (
                <div className="search-results-dropdown">
                    {loading ? (
                        <div className="search-loading">Searching...</div>
                    ) : result && result.length > 0 ? (
                        result.map((user) => (
                            <Link
                                to={`/profile/${user.username}`}
                                key={user._id}
                                className="search-result-item"
                                onClick={() => setQuery('')} // Clear search on click
                            >
                                <img src={user.profileImage} alt={user.username} />
                                <span>{user.username}</span>
                            </Link>
                        ))
                    ) : (
                        <div className="search-no-results">No users found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;