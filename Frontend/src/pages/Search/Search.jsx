import { useState } from 'react';
import SearchBar from '../../components/search/SearchBar';
import UserSearchResult from '../../components/search/UserSearchResult';
import './Search.css';

/**
 * Search Page - Dedicated page for search functionality
 * Combines SearchBar and UserSearchResult for full search experience
 */
const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (query) => {
        setSearchQuery(query);
    };

    return (
        <div className="search-page">
            <div className="search-container">
                {/* Search Header */}
                <div className="search-header">
                    <h2>Search Users</h2>
                    <p>Find and connect with other users</p>
                </div>

                {/* search bar  */}
                <SearchBar isDropdown={false} />

                {/* Full page search results */}
                <UserSearchResult />
            </div>
        </div>
    );
};

export default Search;