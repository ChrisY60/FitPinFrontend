import "./CloseButton.css";

interface CloseButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    "aria-label"?: string;
}

function CloseButton({ onClick, "aria-label": ariaLabel = "Close" }: CloseButtonProps) {
    return (
        <button className="icon-close-btn" onClick={onClick} aria-label={ariaLabel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
            </svg>
        </button>
    );
}

export default CloseButton;
