import { createContext, useContext, useEffect, useState } from "react";

const CompareContext = createContext(null);
const STORAGE_KEY = "nestiq_compare_list";
const MAX_COMPARE = 3;

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    }, [compareList]);

    const isComparing = (id) => compareList.some((h) => h.id === id);

    const toggleCompare = (hostel) => {
        setCompareList((prev) => {
            if (prev.some((h) => h.id === hostel.id)) {
                return prev.filter((h) => h.id !== hostel.id);
            }
            if (prev.length >= MAX_COMPARE) {
                return prev; // caller should check canAddMore before calling
            }
            return [...prev, { id: hostel.id, name: hostel.name, thumbnailUrl: hostel.thumbnailUrl }];
        });
    };

    const clearCompare = () => setCompareList([]);

    const canAddMore = compareList.length < MAX_COMPARE;

    return (
        <CompareContext.Provider
            value={{ compareList, isComparing, toggleCompare, clearCompare, canAddMore, MAX_COMPARE }}
        >
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const ctx = useContext(CompareContext);
    if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
    return ctx;
};
