import React from 'react';
import { Link } from 'react-router-dom';
import useSearchStore from '../../store/searchStore';
import './UserSearchResult.css';

/**
 * UserSearchResult Component - Used for full-page search results
 * Shows comprehensive search results on a dedicated search page
 */
const UserSearchResult = () => {
    // Get search state from your Zustand store
    const { result, loading, error } = useSearchStore();

    // Show loading state
    if (loading) {
        return (
            <div className="search-results-full">
                <div className="search-loading">Searching users...</div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="search-results-full">
                <div className="search-error">{error}</div>
            </div>
        );
    }

    // Render the search results
    return (
        <div className="search-results-full">
            {/* Loop through the result array */}
            {result && result.length > 0 ? (
                <>
                    <h3 className="search-results-title">Search Results</h3>
                    {result.map((user) => (
                        <Link
                            to={`/profile/${user.username}`}
                            key={user._id}
                            className="search-result-item-full"
                            onClick={() => setQuery('')}
                        >
                            <img src={user?.profileImage} alt={user.username} />
                            <div className="user-info">
                                <span className="username">{user.username}</span>
                                {user.fullName && <span className="full-name">{user.fullName}</span>}
                            </div>
                        </Link>
                    ))}
                </>
            ) : (
                <div className="search-no-results-full">
                    <p>No users found. Try searching for something else.</p>
                </div>
            )}
        </div>
    );
};
 
export default UserSearchResult;