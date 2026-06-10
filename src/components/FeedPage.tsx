import React from "react";
import { Link } from "react-router-dom";
import type { CommentResponseDTO, PostResponseDTO } from "../api/fitPinBackendApi";
import {
    addComment,
    deleteComment,
    deletePost,
    getComments,
    getFeed,
    likePost,
    unlikePost,
} from "../api/fitPinBackendApi";
import "./FeedPage.css";
import CloseButton from "./CloseButton";
import defaultProductImage from "../assets/default_product_image.png";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { CAPTION_LIMIT, COMMENT_LIMIT, DOUBLE_CLICK_DELAY } from "../constants";

function timeAgo(timestamp: string): string {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ src, username }: { src: string | null; username: string }) {
    if (src) {
        return <img className="post-avatar post-avatar-img" src={src} alt={username} />;
    }
    return (
        <div className="post-avatar post-avatar-initials">
            {username.charAt(0).toUpperCase()}
        </div>
    );
}

function FeedPage() {
    const loggedInUsername = localStorage.getItem("username") ?? "";

    const [posts, setPosts] = React.useState<PostResponseDTO[]>([]);
    const [flippedPosts, setFlippedPosts] = React.useState<Set<number>>(new Set());
    const [expandedCaptions, setExpandedCaptions] = React.useState<Set<number>>(new Set());

    const [postsLoading, setPostsLoading] = React.useState(true);
    const [postsError, setPostsError] = React.useState(false);

    const [commentsPostId, setCommentsPostId] = React.useState<number | null>(null);
    const [comments, setComments] = React.useState<CommentResponseDTO[]>([]);
    const [commentsLoading, setCommentsLoading] = React.useState(false);
    const [commentsError, setCommentsError] = React.useState(false);
    const [newComment, setNewComment] = React.useState("");
    const [submittingComment, setSubmittingComment] = React.useState(false);
    const [likeErrorPostId, setLikeErrorPostId] = React.useState<number | null>(null);
    const [menuOpenPostId, setMenuOpenPostId] = React.useState<number | null>(null);
    const [heartAnimationPostId, setHeartAnimationPostId] = React.useState<number | null>(null);
    const imageClickTimers = React.useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    React.useEffect(() => {
        async function fetchPosts() {
            try {
                const data = await getFeed();
                setPosts(data);
            } catch {
                setPostsError(true);
            } finally {
                setPostsLoading(false);
            }
        }
        fetchPosts();
    }, []);

    React.useEffect(() => {
        document.body.style.overflow = commentsPostId !== null ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [commentsPostId]);

    React.useEffect(() => {
        const timers = imageClickTimers.current;
        return () => {
            timers.forEach(clearTimeout);
            timers.clear();
        };
    }, []);

    const { setDirty, confirmDiscard } = useUnsavedChanges();
    const { confirm } = useConfirmDialog();

    React.useEffect(() => {
        setDirty(newComment.trim() !== "");
    }, [newComment, setDirty]);

    async function toggleLike(post: PostResponseDTO) {
        setLikeErrorPostId(null);
        try {
            const result = post.likedByCurrentUser
                ? await unlikePost(post.id)
                : await likePost(post.id);
            setPosts((prev) => prev.map((p) =>
                p.id === post.id ? { ...p, likedByCurrentUser: result.liked, likeCount: result.likeCount } : p
            ));
        } catch {
            setLikeErrorPostId(post.id);
            setTimeout(() => setLikeErrorPostId((id) => (id === post.id ? null : id)), 3000);
        }
    }

    async function openComments(postId: number) {
        setCommentsPostId(postId);
        setComments([]);
        setNewComment("");
        setCommentsLoading(true);
        setCommentsError(false);
        try {
            const data = await getComments(postId);
            setComments(data);
        } catch {
            setCommentsError(true);
        } finally {
            setCommentsLoading(false);
        }
    }

    function closeComments() {
        confirmDiscard(() => {
            setCommentsPostId(null);
            setComments([]);
            setNewComment("");
        });
    }

    async function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault();
        if (commentsPostId === null) return;

        const content = newComment.trim();
        if (!content) return;

        setSubmittingComment(true);
        try {
            const comment = await addComment(commentsPostId, content);
            setComments((prev) => [...prev, comment]);
            setNewComment("");
            setPosts((prev) => prev.map((p) =>
                p.id === commentsPostId ? { ...p, commentCount: p.commentCount + 1 } : p
            ));
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setSubmittingComment(false);
        }
    }

    function handleDeleteComment(commentId: number) {
        if (commentsPostId === null) return;
        const postId = commentsPostId;

        confirm({
            title: "Delete comment?",
            message: "This comment will be permanently deleted. This cannot be undone.",
            confirmLabel: "Delete",
            onConfirm: async () => {
                try {
                    await deleteComment(postId, commentId);
                    setComments((prev) => prev.filter((c) => c.id !== commentId));
                    setPosts((prev) => prev.map((p) =>
                        p.id === postId ? { ...p, commentCount: Math.max(p.commentCount - 1, 0) } : p
                    ));
                } catch (err) {
                    console.error("Failed to delete comment", err);
                }
            },
        });
    }

    function toggleMenu(postId: number) {
        setMenuOpenPostId((prev) => (prev === postId ? null : postId));
    }

    function handleDeletePost(postId: number) {
        setMenuOpenPostId(null);

        confirm({
            title: "Delete post?",
            message: "This post will be permanently deleted. This cannot be undone.",
            confirmLabel: "Delete",
            onConfirm: async () => {
                try {
                    await deletePost(postId);
                    setPosts((prev) => prev.filter((p) => p.id !== postId));
                } catch (err) {
                    console.error("Failed to delete post", err);
                }
            },
        });
    }

    function toggleFlip(postId: number) {
        setFlippedPosts((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    }

    function handleImageClick(post: PostResponseDTO) {
        const pendingTimer = imageClickTimers.current.get(post.id);
        if (pendingTimer) {
            clearTimeout(pendingTimer);
            imageClickTimers.current.delete(post.id);

            if (!post.likedByCurrentUser) {
                toggleLike(post);
            }
            setHeartAnimationPostId(post.id);
            setTimeout(() => {
                setHeartAnimationPostId((id) => (id === post.id ? null : id));
            }, 800);
            return;
        }

        const timer = setTimeout(() => {
            imageClickTimers.current.delete(post.id);
            toggleFlip(post.id);
        }, DOUBLE_CLICK_DELAY);
        imageClickTimers.current.set(post.id, timer);
    }

    function toggleCaption(postId: number) {
        setExpandedCaptions((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    }

    return (
        <div className="feed">
            {postsLoading ? (
                <p className="feed-status">Loading posts…</p>
            ) : postsError ? (
                <p className="feed-status feed-status-error">Failed to load posts. Please try again later.</p>
            ) : (
            posts.map((post) => {
                const flipped = flippedPosts.has(post.id);
                const captionExpanded = expandedCaptions.has(post.id);
                const captionLong = post.caption && post.caption.length > CAPTION_LIMIT;

                return (
                    <div key={post.id} className="post-card">

                        <div className="post-header">
                            <Link to={`/profile/${post.publisherUsername}`} className="post-header-link">
                                <Avatar src={post.publisherProfilePictureUrl} username={post.publisherUsername} />
                                <div className="post-header-info">
                                    <span className="post-username">{post.publisherUsername}</span>
                                    <span className="post-timestamp">{timeAgo(post.timestamp)}</span>
                                </div>
                            </Link>

                            {post.publisherUsername === loggedInUsername && (
                                <div className="post-menu">
                                    <button
                                        className="post-menu-btn"
                                        aria-label="Post options"
                                        onClick={() => toggleMenu(post.id)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="2" />
                                            <circle cx="12" cy="12" r="2" />
                                            <circle cx="12" cy="19" r="2" />
                                        </svg>
                                    </button>

                                    {menuOpenPostId === post.id && (
                                        <>
                                            <div className="post-menu-overlay" onClick={() => setMenuOpenPostId(null)} />
                                            <div className="post-menu-dropdown">
                                                <button
                                                    className="post-menu-item post-menu-item-delete"
                                                    onClick={() => handleDeletePost(post.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div
                            className={`post-image-flipper${flipped ? " flipped" : ""}`}
                            onClick={() => handleImageClick(post)}
                        >
                            <div className="post-image-front">
                                <img className="post-image" src={post.imageUrl} alt={post.caption} />
                                <div className="post-image-overlay">Click to View the Clothes</div>
                                {heartAnimationPostId === post.id && (
                                    <svg className="like-animation-heart" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                )}
                            </div>

                            <div className="post-image-back" onClick={(e) => e.stopPropagation()}>
                                <div className="post-products-header">
                                    <span>Products</span>
                                    <CloseButton onClick={(e) => { e.stopPropagation(); toggleFlip(post.id); }} />
                                </div>
                                <ul className="post-products-list">
                                    {post.products.length === 0 ? (
                                        <li className="post-products-empty">No products tagged.</li>
                                    ) : (
                                        post.products.map((product) => (
                                            <li key={product.id} className="post-product-item">
                                                <div className="post-product-icon">
                                                    <img
                                                        src={product.imageUrl ?? defaultProductImage}
                                                        alt={product.name}
                                                    />
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
                                <button
                                    className={`post-action${post.likedByCurrentUser ? " post-action-liked" : ""}`}
                                    onClick={() => toggleLike(post)}
                                >
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8} fill={post.likedByCurrentUser ? "currentColor" : "none"}>
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    {post.likeCount}
                                </button>
                                <button className="post-action" onClick={() => openComments(post.id)}>
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    {post.commentCount}
                                </button>
                                <button className="post-action post-action-save">
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                                </button>
                            </div>
                            {likeErrorPostId === post.id && (
                                <p className="post-like-error">Could not update like. Please try again.</p>
                            )}
                        </div>

                        {post.tags.length > 0 && (
                            <div className="post-tags">
                                {post.tags.map((tag) => (
                                    <span key={tag.id} className="post-tag">#{tag.name}</span>
                                ))}
                            </div>
                        )}

                        {post.caption && (
                            <div className="post-caption">
                                <span>
                                    {captionLong && !captionExpanded
                                        ? post.caption.slice(0, CAPTION_LIMIT) + "…"
                                        : post.caption}
                                </span>
                                {captionLong && (
                                    <button
                                        className="post-caption-toggle"
                                        onClick={() => toggleCaption(post.id)}
                                    >
                                        {captionExpanded ? " less" : " more"}
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                );
            })
            )}

            {commentsPostId !== null && (
                <div className="comments-overlay" onClick={closeComments}>
                    <div className="comments-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="comments-header">
                            <span>Comments</span>
                            <CloseButton onClick={closeComments} />
                        </div>

                        <div className="comments-list">
                            {commentsLoading ? (
                                <p className="comments-empty">Loading…</p>
                            ) : commentsError ? (
                                <p className="comments-error">Failed to load comments. Please try again.</p>
                            ) : comments.length === 0 ? (
                                <p className="comments-empty">No comments yet. Be the first to comment!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="comment-item">
                                        <Avatar src={comment.authorProfilePictureUrl} username={comment.authorUsername} />
                                        <div className="comment-body">
                                            <span className="comment-author">{comment.authorUsername}</span>
                                            <span className="comment-content">{comment.content}</span>
                                            <span className="comment-timestamp">{timeAgo(comment.timestamp)}</span>
                                        </div>
                                        {comment.authorUsername === loggedInUsername && (
                                            <button
                                                className="comment-delete-btn"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                aria-label="Delete comment"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                                                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <form className="comment-form" onSubmit={handleSubmitComment}>
                            <div className="comment-input-row">
                                <input
                                    className="comment-input"
                                    placeholder="Add a comment…"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    maxLength={COMMENT_LIMIT}
                                />
                                <button
                                    className="comment-submit-btn"
                                    type="submit"
                                    disabled={!newComment.trim() || submittingComment}
                                >
                                    Post
                                </button>
                            </div>
                            <span className="comment-char-count">{newComment.length}/{COMMENT_LIMIT}</span>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeedPage;
