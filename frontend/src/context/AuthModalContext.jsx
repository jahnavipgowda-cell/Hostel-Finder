import { createContext, useContext, useState, useCallback } from "react";

const AuthModalContext = createContext(null);

export const AuthModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [onSuccess, setOnSuccess] = useState(null);
    const [reason, setReason] = useState("");

    // `reason` is shown as the modal's subtitle so the prompt feels
    // contextual ("Login to enquire about this property") instead of a
    // generic "please log in" wall — it appears right where the user
    // triggered it rather than sending them off to a separate page.
    const openAuthModal = useCallback((successCallback, reasonText) => {
        setOnSuccess(() => successCallback || null);
        setReason(reasonText || "");
        setIsOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsOpen(false);
        setOnSuccess(null);
        setReason("");
    }, []);

    const handleSuccess = useCallback(() => {
        setIsOpen(false);
        if (onSuccess) onSuccess();
        setOnSuccess(null);
        setReason("");
    }, [onSuccess]);

    return (
        <AuthModalContext.Provider
            value={{ isOpen, reason, openAuthModal, closeAuthModal, handleSuccess }}
        >
            {children}
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => {
    const ctx = useContext(AuthModalContext);
    if (!ctx) throw new Error("useAuthModal must be used within an AuthModalProvider");
    return ctx;
};
