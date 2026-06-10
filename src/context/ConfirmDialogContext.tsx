import React from "react";
import "./ConfirmDialogContext.css";

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
}

interface ConfirmDialogContextValue {
    confirm: (options: ConfirmOptions) => void;
}

const ConfirmDialogContext = React.createContext<ConfirmDialogContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
    const [pending, setPending] = React.useState<ConfirmOptions | null>(null);

    const confirm = React.useCallback((options: ConfirmOptions) => {
        setPending(options);
    }, []);

    function handleCancel() {
        setPending(null);
    }

    function handleConfirm() {
        const action = pending?.onConfirm;
        setPending(null);
        action?.();
    }

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            {pending && (
                <div className="confirm-modal-overlay" onClick={handleCancel}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3>{pending.title ?? "Are you sure?"}</h3>
                        <p>{pending.message}</p>
                        <div className="confirm-modal-actions">
                            <button className="confirm-modal-cancel" onClick={handleCancel}>
                                {pending.cancelLabel ?? "Cancel"}
                            </button>
                            <button
                                className={`confirm-modal-confirm${pending.variant === "default" ? " confirm-modal-confirm-default" : ""}`}
                                onClick={handleConfirm}
                            >
                                {pending.confirmLabel ?? "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmDialogContext.Provider>
    );
}

export function useConfirmDialog() {
    const ctx = React.useContext(ConfirmDialogContext);
    if (!ctx) throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
    return ctx;
}
