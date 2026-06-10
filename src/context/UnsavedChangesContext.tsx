import React from "react";
import "./UnsavedChangesContext.css";

interface UnsavedChangesContextValue {
    isDirty: boolean;
    setDirty: (dirty: boolean) => void;
    confirmDiscard: (onConfirm: () => void) => void;
}

const UnsavedChangesContext = React.createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
    const [isDirty, setIsDirty] = React.useState(false);
    const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null);

    const setDirty = React.useCallback((dirty: boolean) => setIsDirty(dirty), []);

    const confirmDiscard = React.useCallback((onConfirm: () => void) => {
        if (isDirty) {
            setPendingAction(() => onConfirm);
        } else {
            onConfirm();
        }
    }, [isDirty]);

    function handleDiscard() {
        const action = pendingAction;
        setIsDirty(false);
        setPendingAction(null);
        action?.();
    }

    function handleKeepEditing() {
        setPendingAction(null);
    }

    return (
        <UnsavedChangesContext.Provider value={{ isDirty, setDirty, confirmDiscard }}>
            {children}
            {pendingAction && (
                <div className="unsaved-modal-overlay" onClick={handleKeepEditing}>
                    <div className="unsaved-modal" onClick={e => e.stopPropagation()}>
                        <h3>Discard changes?</h3>
                        <p>You have unsaved changes. If you leave now, they will be lost.</p>
                        <div className="unsaved-modal-actions">
                            <button className="unsaved-modal-keep" onClick={handleKeepEditing}>
                                Keep editing
                            </button>
                            <button className="unsaved-modal-discard" onClick={handleDiscard}>
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    const ctx = React.useContext(UnsavedChangesContext);
    if (!ctx) throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
    return ctx;
}
