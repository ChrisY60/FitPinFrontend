import React from "react";
import { useNavigate } from "react-router-dom";
import type { NotificationResponseDTO } from "../api/fitPinBackendApi";
import { getNotifications, markAllNotificationsAsRead } from "../api/fitPinBackendApi";
import "./NotificationsPage.css";

function timeAgo(timestamp: string): string {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ src, username }: { src: string | null; username: string }) {
    if (src) {
        return <img className="notification-avatar notification-avatar-img" src={src} alt={username} />;
    }
    return (
        <div className="notification-avatar notification-avatar-initials">
            {username.charAt(0).toUpperCase()}
        </div>
    );
}

function notificationMessage(notification: NotificationResponseDTO): string {
    return notification.type === "LIKE" ? "liked your post" : "commented on your post";
}

function NotificationsPage() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = React.useState<NotificationResponseDTO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        setLoading(true);
        setError("");
        getNotifications()
            .then(setNotifications)
            .catch(() => setError("Could not load notifications."))
            .finally(() => setLoading(false));

        return () => {
            markAllNotificationsAsRead().catch(() => {});
        };
    }, []);

    function handleSelect(notification: NotificationResponseDTO) {
        navigate(`/profile/${notification.actorUsername}`);
    }

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <h1 className="notifications-title">Notifications</h1>
            </div>

            {loading ? (
                <p className="notifications-empty">Loading…</p>
            ) : error ? (
                <p className="notifications-error">{error}</p>
            ) : notifications.length === 0 ? (
                <p className="notifications-empty">No notifications yet.</p>
            ) : (
                <ul className="notifications-list">
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            className={`notification-item${notification.read ? "" : " notification-unread"}`}
                            onClick={() => handleSelect(notification)}
                        >
                            <Avatar src={notification.actorProfilePictureUrl} username={notification.actorUsername} />
                            <div className="notification-body">
                                <span className="notification-text">
                                    <span className="notification-actor">{notification.actorUsername}</span>
                                    {" "}{notificationMessage(notification)}
                                </span>
                                <span className="notification-timestamp">{timeAgo(notification.timestamp)}</span>
                            </div>
                            {notification.postImageUrl && (
                                <img className="notification-thumbnail" src={notification.postImageUrl} alt="Post" />
                            )}
                            {!notification.read && <span className="notification-dot" aria-hidden="true" />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default NotificationsPage;
