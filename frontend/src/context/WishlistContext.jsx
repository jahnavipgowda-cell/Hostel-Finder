import { createContext, useContext, useEffect, useState, useCallback } from "react";

import { getSavedHostels, saveHostel, unsaveHostel } from "../services/userService";
import { isLoggedIn } from "../services/authService";

const WishlistContext = createContext(null);

/**
 * Backed by the real /users/me/saved endpoints (UserController already had
 * these — saveHostel/unsaveHostel/getSavedHostels existed in userService.js
 * too — nothing in the UI ever called them). This just gives every
 * HostelCard a shared, single source of truth for "is this saved" so the
 * heart icon stays in sync across the home page, search results, and
 * details page without each card fetching independently.
 */
export const WishlistProvider = ({ children }) => {
    const [savedIds, setSavedIds] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const refresh = useCallback(() => {
        if (!isLoggedIn()) {
            setSavedIds([]);
            setLoaded(true);
            return;
        }
        getSavedHostels()
            .then((data) => setSavedIds(Array.isArray(data?.savedHostelIds) ? data.savedHostelIds : []))
            .catch(() => setSavedIds([]))
            .finally(() => setLoaded(true));
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const isSaved = (id) => savedIds.includes(id);

    // Optimistic toggle: flip locally first (instant heart feedback), then
    // sync to the backend; roll back only if the request actually fails.
    const toggleSaved = async (id) => {
        const wasSaved = isSaved(id);
        setSavedIds((prev) => (wasSaved ? prev.filter((x) => x !== id) : [...prev, id]));
        try {
            if (wasSaved) {
                await unsaveHostel(id);
            } else {
                await saveHostel(id);
            }
        } catch (err) {
            setSavedIds((prev) => (wasSaved ? [...prev, id] : prev.filter((x) => x !== id)));
            throw err;
        }
    };

    return (
        <WishlistContext.Provider value={{ savedIds, loaded, isSaved, toggleSaved, refresh }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
    return ctx;
};
