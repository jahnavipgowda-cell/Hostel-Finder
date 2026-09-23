import "../styles/filter.css";

// Keys match the backend's amenity keys in HostelSpecifications (AC and
// ATTACHED_BATHROOM are checked against room_types, the rest against the
// facilities list — see that class for exactly how each is matched).
const AMENITIES = [
    { key: "WIFI", label: "Wi-Fi" },
    { key: "AC", label: "AC" },
    { key: "LAUNDRY", label: "Laundry" },
    { key: "PARKING", label: "Parking" },
    { key: "ATTACHED_BATHROOM", label: "Attached Bathroom" },
    { key: "POWER_BACKUP", label: "Power Backup" },
    { key: "SECURITY", label: "Security" },
    { key: "CCTV", label: "CCTV" },
    { key: "HOUSEKEEPING", label: "Housekeeping" },
    { key: "STUDY_AREA", label: "Study Area" },
    { key: "FURNISHED", label: "Furnished" },
];

const Filter = ({ filters, setFilters, onApply, onReset, cities = [] }) => {
    const update = (field) => (e) =>
        setFilters({ ...filters, [field]: e.target.value });

    const toggleAmenity = (key) => {
        const current = filters.amenities || [];
        const next = current.includes(key)
            ? current.filter((a) => a !== key)
            : [...current, key];
        setFilters({ ...filters, amenities: next });
    };

    return (
        <div className="filter-box">
            <div className="filter-field">
                <label>City</label>
                <select value={filters.city || ""} onChange={update("city")}>
                    <option value="">All Cities</option>
                    {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="filter-field">
                <label>Type</label>
                <select value={filters.type || ""} onChange={update("type")}>
                    <option value="">All Types</option>
                    <option value="PG">PG</option>
                    <option value="HOSTEL">Hostel</option>
                    <option value="CO_LIVING">Co-Living</option>
                    <option value="WORKING_PROFESSIONAL">Working Professional</option>
                    <option value="STUDENT_RESIDENCE">Student Residence</option>
                </select>
            </div>

            <div className="filter-field">
                <label>Gender</label>
                <select value={filters.genderType || ""} onChange={update("genderType")}>
                    <option value="">Any</option>
                    <option value="FEMALE">Girls</option>
                    <option value="MALE">Boys</option>
                    <option value="MIXED">Unisex</option>
                </select>
            </div>

            <div className="filter-field">
                <label>Sharing Type</label>
                <select value={filters.sharingType || ""} onChange={update("sharingType")}>
                    <option value="">Any Sharing</option>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE_SHARING">Double Sharing</option>
                    <option value="TRIPLE_SHARING">Triple Sharing</option>
                    <option value="DORMITORY">Dormitory</option>
                    <option value="PRIVATE_SUITE">Private Suite</option>
                </select>
            </div>

            {/* Min/Max used to be two separate grid cells, each free to grow
                to its own column — on narrower widths (and with number-input
                spinner arrows) that pushed the pair past the edge of the
                filter bar. Grouping them into one bordered "range" control
                with a fixed internal layout means they can never separate
                or overflow, and it reads as a single, obviously-related
                control the way price ranges normally look. */}
            <div className="filter-field price-range-field">
                <label>Price Range (₹/month)</label>
                <div className="price-range-box">
                    <span className="price-range-currency">₹</span>
                    <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={update("minPrice")}
                    />
                    <span className="price-range-sep">–</span>
                    <span className="price-range-currency">₹</span>
                    <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={update("maxPrice")}
                    />
                </div>
            </div>

            <div className="filter-field amenity-field">
                <label>Amenities</label>
                <div className="amenity-chips">
                    <button
                        type="button"
                        className={`amenity-chip${filters.foodIncluded ? " active" : ""}`}
                        onClick={() => setFilters({ ...filters, foodIncluded: !filters.foodIncluded })}
                        aria-pressed={!!filters.foodIncluded}
                    >
                        {filters.foodIncluded ? "✓ Food" : "Food"}
                    </button>
                    {AMENITIES.map(({ key, label }) => {
                        const active = (filters.amenities || []).includes(key);
                        return (
                            <button
                                type="button"
                                key={key}
                                className={`amenity-chip${active ? " active" : ""}`}
                                onClick={() => toggleAmenity(key)}
                                aria-pressed={active}
                            >
                                {active ? `✓ ${label}` : label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="filter-actions">
                <button onClick={onApply}>Apply Filters</button>
                <button className="reset-btn" onClick={onReset}>Reset</button>
            </div>
        </div>
    );
};

export default Filter;
