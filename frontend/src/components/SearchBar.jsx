import { useState } from "react";
import "../styles/searchbar.css";

const SearchBar = ({ onSearch }) => {

    const [query, setQuery] = useState("");
    const [type, setType] = useState("");

    const handleSearch = () => {

        onSearch({
            query,
            type
        });

    };

    return (

        <div className="search-container">

            <input
                type="text"
                placeholder="Search by city, locality or hostel..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="">All Types</option>
                <option value="HOSTEL">Hostel</option>
                <option value="PG">PG</option>
                <option value="CO_LIVING">Co-Living</option>
            </select>

            <button onClick={handleSearch}>
                Search
            </button>

        </div>

    );
};

export default SearchBar;