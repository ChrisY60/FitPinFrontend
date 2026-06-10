import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { PostResponseDTO, UserProfileResponse } from "../api/fitPinBackendApi";
import { getUserPosts, getUserProfile, updateProfile } from "../api/fitPinBackendApi";
import defaultProductImage from "../assets/default_product_image.png";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import "./ProfilePage.css";
import CloseButton from "./CloseButton";

function timeAgo(timestamp: string): string {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const loggedInUsername = localStorage.getItem("username") ?? "";
    const isOwnProfile = username === loggedInUsername;

    const [profile, setProfile] = React.useState<UserProfileResponse | null>(null);
    const [posts, setPosts] = React.useState<PostResponseDTO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const [editing, setEditing] = React.useState(false);
    const [editBio, setEditBio] = React.useState("");
    const [editPictureUrl, setEditPictureUrl] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [saveError, setSaveError] = React.useState("");

    const [selectedPost, setSelectedPost] = React.useState<PostResponseDTO | null>(null);
    const [modalFlipped, setModalFlipped] = React.useState(false);

    React.useEffect(() => {
        if (!username) return;
        setLoading(true);
        setError("");
        Promise.all([getUserProfile(username), getUserPosts(username)])
            .then(([prof, userPosts]) => {
                setProfile(prof);
                setPosts(userPosts);
            })
            .catch(() => setError("Could not load profile."))
            .finally(() => setLoading(false));
    }, [username]);

    React.useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setSelectedPost(null);
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    React.useEffect(() => {
        document.body.style.overflow = selectedPost ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [selectedPost]);

    function openPost(post: PostResponseDTO) {
        setSelectedPost(post);
        setModalFlipped(false);
    }

    const { setDirty, confirmDiscard } = useUnsavedChanges();
    const { confirm } = useConfirmDialog();

    const hasProfileChanges =
        editing &&
        (editBio !== (profile?.bio ?? "") || editPictureUrl !== (profile?.profilePictureUrl ?? ""));

    React.useEffect(() => {
        setDirty(hasProfileChanges);
    }, [hasProfileChanges, setDirty]);

    function startEdit() {
        setEditBio(profile?.bio ?? "");
        setEditPictureUrl(profile?.profilePictureUrl ?? "");
        setSaveError("");
        setEditing(true);
    }

    function cancelEdit() {
        confirmDiscard(() => setEditing(false));
    }

    async function saveEdit() {
        setSaving(true);
        setSaveError("");
        try {
            const updated = await updateProfile({ bio: editBio, profilePictureUrl: editPictureUrl });
            setProfile(updated);
            localStorage.setItem("profilePictureUrl", editPictureUrl);
            setEditing(false);
        } catch {
            setSaveError("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    }

    function handleLogout() {
        confirm({
            title: "Log out?",
            message: "You will need to log in again to access your account.",
            confirmLabel: "Log out",
            variant: "default",
            onConfirm: () => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("username");
                localStorage.removeItem("userId");
                localStorage.removeItem("profilePictureUrl");
                navigate("/login");
            },
        });
    }

    if (loading) {
        return <div className="profile-page"><p className="profile-loading">Loading…</p></div>;
    }

    if (error || !profile) {
        return <div className="profile-page"><p className="profile-error">{error || "Profile not found."}</p></div>;
    }

    return (
        <div className="profile-page">

            {/* ── Header card ── */}
            <div className="profile-header-card">
                <div className="profile-avatar-wrap">
                    {profile.profilePictureUrl
                        ? <img className="profile-avatar" src={profile.profilePictureUrl} alt={profile.username} />
                        : <div className="profile-avatar profile-avatar-initials">
                            {profile.username.charAt(0).toUpperCase()}
                          </div>
                    }
                </div>

                <div className="profile-info">
                    <h2 className="profile-username">{profile.username}</h2>
                    <p className="profile-stats">{profile.postCount} {profile.postCount === 1 ? "post" : "posts"}</p>
                    {!editing && (
                        <p className="profile-bio">{profile.bio || (isOwnProfile ? "No bio yet." : "")}</p>
                    )}
                </div>

                {isOwnProfile && !editing && (
                    <div className="profile-actions">
                        <button className="profile-btn-edit" onClick={startEdit}>Edit Profile</button>
                        <button className="profile-btn-logout" onClick={handleLogout}>Log out</button>
                    </div>
                )}
            </div>

            {/* ── Edit form ── */}
            {editing && (
                <div className="profile-edit-card">
                    <label className="profile-edit-label">Profile Picture URL</label>
                    <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={editPictureUrl}
                        onChange={e => setEditPictureUrl(e.target.value)}
                    />
                    {editPictureUrl && (
                        <img className="profile-edit-preview" src={editPictureUrl} alt="preview" />
                    )}

                    <label className="profile-edit-label">Bio</label>
                    <textarea
                        placeholder="Tell people about your style…"
                        value={editBio}
                        onChange={e => setEditBio(e.target.value)}
                        rows={3}
                    />

                    {saveError && <p className="profile-save-error">{saveError}</p>}

                    <div className="profile-edit-actions">
                        <button className="profile-btn-save" onClick={saveEdit} disabled={saving}>
                            {saving ? "Saving…" : "Save"}
                        </button>
                        <button className="profile-btn-cancel" onClick={cancelEdit}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── Posts grid ── */}
            <div className="profile-posts-section">
                <h3 className="profile-posts-title">Posts</h3>
                {posts.length === 0 ? (
                    <p className="profile-posts-empty">
                        {isOwnProfile ? "You haven't posted yet." : "No posts yet."}
                    </p>
                ) : (
                    <div className="profile-posts-grid">
                        {posts.map(post => (
                            <div
                                key={post.id}
                                className="profile-post-thumb"
                                onClick={() => openPost(post)}
                            >
                                <img src={post.imageUrl} alt={post.caption} />
                                {post.products.length > 0 && (
                                    <span className="profile-post-products-badge">
                                        {post.products.length}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Post modal — identical to the feed card ── */}
            {selectedPost && (
                <div className="post-modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div className="post-card post-modal-card" onClick={e => e.stopPropagation()}>

                        <div className="post-header">
                            <Link
                                to={`/profile/${selectedPost.publisherUsername}`}
                                className="post-header-link"
                                onClick={() => setSelectedPost(null)}
                            >
                                {selectedPost.publisherProfilePictureUrl
                                    ? <img className="post-avatar post-avatar-img" src={selectedPost.publisherProfilePictureUrl} alt={selectedPost.publisherUsername} />
                                    : <div className="post-avatar post-avatar-initials">{selectedPost.publisherUsername.charAt(0).toUpperCase()}</div>
                                }
                                <div className="post-header-info">
                                    <span className="post-username">{selectedPost.publisherUsername}</span>
                                    <span className="post-timestamp">{timeAgo(selectedPost.timestamp)}</span>
                                </div>
                            </Link>

                            <CloseButton onClick={() => setSelectedPost(null)} />
                        </div>

                        <div
                            className={`post-image-flipper${modalFlipped ? " flipped" : ""}`}
                            onClick={() => setModalFlipped(f => !f)}
                        >
                            <div className="post-image-front">
                                <img className="post-image" src={selectedPost.imageUrl} alt={selectedPost.caption} />
                                <div className="post-image-overlay">Click to View the Clothes</div>
                            </div>

                            <div className="post-image-back" onClick={e => e.stopPropagation()}>
                                <div className="post-products-header">
                                    <span>Products</span>
                                    <CloseButton onClick={e => { e.stopPropagation(); setModalFlipped(false); }} />
                                </div>
                                <ul className="post-products-list">
                                    {selectedPost.products.length === 0 ? (
                                        <li className="post-products-empty">No products tagged.</li>
                                    ) : (
                                        selectedPost.products.map(product => (
                                            <li key={product.id} className="post-product-item">
                                                <div className="post-product-icon">
                                                    <img src={product.imageUrl ?? defaultProductImage} alt={product.name} />
                                                </div>
                                                <div className="post-product-info">
                                                    <span className="post-product-name">{product.name}</span>
                                                    <span className="post-product-brand">{product.brand.name}</span>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="post-footer">
                            <div className="post-actions">
                                <button className="post-action">
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                    {selectedPost.likeCount}
                                </button>
                                <button className="post-action">
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    {selectedPost.commentCount}
                                </button>
                                <button className="post-action post-action-save">
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                                </button>
                            </div>
                        </div>

                        {selectedPost.tags.length > 0 && (
                            <div className="post-tags">
                                {selectedPost.tags.map(tag => (
                                    <span key={tag.id} className="post-tag">{tag.name}</span>
                                ))}
                            </div>
                        )}

                        {selectedPost.caption && (
                            <div className="post-caption">{selectedPost.caption}</div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default ProfilePage;
