import React from "react";
import { getFeed } from "../api/fitPinBackendApi";
import "./FeedPage.css";
import defaultProductImage from "../assets/default_product_image.png";

interface BrandDTO {
    id: number;
    name: string;
}

interface ProductDTO {
    id: number;
    name: string;
    brand: BrandDTO;
}

interface TagDTO {
    id: number;
    name: string;
}

interface PostResponseDTO {
    id: number;
    publisherUsername: string;
    timestamp: string;
    imageUrl: string;
    caption: string;
    likeCount: number;
    commentCount: number;
    tags: TagDTO[];
    products: ProductDTO[];
}

function timeAgo(timestamp: string): string {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function FeedPage() {
    const [posts, setPosts] = React.useState<PostResponseDTO[]>([]);
    const [flippedPosts, setFlippedPosts] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        async function fetchPosts() {
            const data = await getFeed();
            setPosts(data);
        }
        fetchPosts();
    }, []);

    function toggleFlip(postId: number) {
        setFlippedPosts((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    }

    return (
        <div className="feed">
            {posts.map((post) => {
                const flipped = flippedPosts.has(post.id);
                return (
                    <div key={post.id} className="post-card">

                        <div className="post-header">
                            <div className="post-avatar" />
                            <div className="post-header-info">
                                <span className="post-username">{post.publisherUsername}</span>
                                <span className="post-timestamp">{timeAgo(post.timestamp)}</span>
                            </div>
                        </div>

                        <div
                            className={`post-image-flipper${flipped ? " flipped" : ""}`}
                            onClick={() => toggleFlip(post.id)}
                        >
                            {/* Front — photo */}
                            <div className="post-image-front">
                                <img className="post-image" src={post.imageUrl} alt={post.caption} />
                                <div className="post-image-overlay">Click to View the Clothes</div>
                            </div>

                            {/* Back — products */}
                            <div className="post-image-back" onClick={(e) => e.stopPropagation()}>
                                <div className="post-products-header">
                                    <span>Products</span>
                                    <button
                                        className="post-products-close"
                                        onClick={(e) => { e.stopPropagation(); toggleFlip(post.id); }}
                                    >
                                        <svg viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none">
                                            <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                                <ul className="post-products-list">
                                    {post.products.length === 0 ? (
                                        <li className="post-products-empty">No products tagged.</li>
                                    ) : (
                                        post.products.map((product) => (
                                            <li key={product.id} className="post-product-item">
                                                <div className="post-product-icon">
                                                    <img src={defaultProductImage} alt="product" />
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
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                    {post.likeCount}
                                </button>
                                <button className="post-action">
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    {post.commentCount}
                                </button>
                                <button className="post-action post-action-save">
                                    <svg viewBox="0 0 24 24" strokeWidth={1.8}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                                </button>
                            </div>
                        </div>

                        {post.tags.length > 0 && (
                            <div className="post-tags">
                                {post.tags.map((tag) => (
                                    <span key={tag.id} className="post-tag">{tag.name}</span>
                                ))}
                            </div>
                        )}

                    </div>
                );
            })}
        </div>
    );
}

export default FeedPage;
