import { useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import "../styles/comparebar.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=100&q=60&auto=format&fit=crop";

const CompareBar = () => {
    const { compareList, toggleCompare, clearCompare, MAX_COMPARE } = useCompare();
    const navigate = useNavigate();

    if (compareList.length === 0) return null;

    return (
        <div className="compare-bar">
            <div className="compare-bar-items">
                {compareList.map((h) => (
                    <div className="compare-bar-item" key={h.id}>
                        <img src={h.thumbnailUrl || FALLBACK_IMAGE} alt={h.name} />
                        <span>{h.name}</span>
                        <button
                            className="compare-bar-remove"
                            onClick={() => toggleCompare(h)}
                            title="Remove"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                    <div className="compare-bar-slot" key={`empty-${i}`}>
                        Add {compareList.length + i === 0 ? "a" : "another"} hostel
                    </div>
                ))}
            </div>

            <div className="compare-bar-actions">
                <button className="compare-bar-clear" onClick={clearCompare}>
                    Clear
                </button>
                <button
                    className="compare-bar-go"
                    disabled={compareList.length < 2}
                    onClick={() => navigate(`/compare?ids=${compareList.map((h) => h.id).join(",")}`)}
                >
                    Compare {compareList.length > 1 ? `(${compareList.length})` : ""} →
                </button>
            </div>
        </div>
    );
};

export default CompareBar;
