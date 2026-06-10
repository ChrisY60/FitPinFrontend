import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ProductDTO } from "../api/fitPinBackendApi";
import { createPost, getProducts } from "../api/fitPinBackendApi";
import defaultProductImage from "../assets/default_product_image.png";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import { CAPTION_LIMIT } from "../constants";
import "./CreatePostForm.css";

function CreatePostForm() {
    const [imageUrl, setImageUrl] = useState("");
    const [caption, setCaption] = useState("");

    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsFetched, setProductsFetched] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const username = localStorage.getItem("username") ?? "";

    async function handleProductSearch(value: string) {
        setProductSearch(value);
        if (!productsFetched && value.trim()) {
            setProductsLoading(true);
            try {
                const data = await getProducts();
                setProducts(data);
                setProductsFetched(true);
            } catch {
                setProducts([]);
            } finally {
                setProductsLoading(false);
            }
        }
    }

    function toggleProduct(id: number) {
        setSelectedProductIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function addTag() {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags(prev => [...prev, trimmed]);
        }
        setTagInput("");
    }

    function removeTag(tag: string) {
        setTags(prev => prev.filter(t => t !== tag));
    }

    function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const { setDirty, confirmDiscard } = useUnsavedChanges();
    const { confirm } = useConfirmDialog();

    const hasUnsavedChanges =
        imageUrl.trim() !== "" ||
        caption.trim() !== "" ||
        selectedProductIds.size > 0 ||
        tags.length > 0 ||
        tagInput.trim() !== "";

    React.useEffect(() => {
        setDirty(hasUnsavedChanges);
    }, [hasUnsavedChanges, setDirty]);

    function handleCancel() {
        confirmDiscard(() => navigate("/"));
    }

    async function publishPost() {
        setError("");
        setSubmitting(true);
        try {
            await createPost({
                imageUrl,
                caption,
                productIds: [...selectedProductIds],
                tagNames: tags,
            });
            setDirty(false);
            navigate("/");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })
                .response?.data?.message ?? "Failed to create post.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        confirm({
            title: "Share post?",
            message: "Once shared, this post will be visible to your followers.",
            confirmLabel: "Share",
            variant: "default",
            onConfirm: publishPost,
        });
    }

    return (
        <div className="create-post-page">
            <div className="create-post-card">
                <h2>New Post</h2>

                <form onSubmit={handleSubmit} className="create-post-form">

                    {/* ── Image URL ── */}
                    <label className="create-post-label">
                        Image URL <span className="required">*</span>
                    </label>
                    <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        required
                    />

                    {/* ── Preview ── */}
                    <div className="create-post-preview">
                        {imageUrl
                            ? <img src={imageUrl} alt="Preview" className="create-post-img" />
                            : <span className="create-post-placeholder">Image preview</span>
                        }
                    </div>

                    {/* ── Caption ── */}
                    <label className="create-post-label">Caption</label>
                    <textarea
                        placeholder={`What are you wearing, ${username}?`}
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        rows={3}
                        maxLength={CAPTION_LIMIT}
                    />
                    <span className="caption-char-count">{caption.length}/{CAPTION_LIMIT}</span>

                    {/* ── Product Picker ── */}
                    <label className="create-post-label">Products worn</label>

                    {selectedProductIds.size > 0 && (
                        <div className="selected-products">
                            {[...selectedProductIds].map(id => {
                                const p = products.find(pr => pr.id === id);
                                return p ? (
                                    <span key={id} className="selected-product-chip">
                                        {p.name}
                                        <button
                                            type="button"
                                            className="chip-remove"
                                            onClick={() => toggleProduct(id)}
                                        >×</button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}

                    <div className="product-picker">
                        <input
                            type="text"
                            className={`product-search${productSearch.trim() ? " has-results" : ""}`}
                            placeholder="Search by name or brand…"
                            value={productSearch}
                            onChange={e => handleProductSearch(e.target.value)}
                        />
                        {productSearch.trim() && (
                            <ul className="product-list">
                                {productsLoading ? (
                                    <li className="product-list-loading">
                                        <span className="product-list-spinner" />
                                        Loading…
                                    </li>
                                ) : filteredProducts.length === 0 ? (
                                    <li className="product-list-empty">No products found.</li>
                                ) : (
                                    filteredProducts.map(p => {
                                        const selected = selectedProductIds.has(p.id);
                                        return (
                                            <li
                                                key={p.id}
                                                className={`product-list-item${selected ? " selected" : ""}`}
                                                onClick={() => toggleProduct(p.id)}
                                            >
                                                <div className="product-list-check">
                                                    {selected && (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <img
                                                    className="product-list-img"
                                                    src={p.imageUrl ?? defaultProductImage}
                                                    alt={p.name}
                                                />
                                                <div className="product-list-info">
                                                    <span className="product-list-name">{p.name}</span>
                                                    <span className="product-list-brand">{p.brand.name}</span>
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        )}
                    </div>

                    {/* ── Tags ── */}
                    <label className="create-post-label">Tags</label>

                    {tags.length > 0 && (
                        <div className="tags-row">
                            {tags.map(tag => (
                                <span key={tag} className="tag-chip">
                                    #{tag}
                                    <button
                                        type="button"
                                        className="chip-remove"
                                        onClick={() => removeTag(tag)}
                                    >×</button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="tag-input-row">
                        <input
                            type="text"
                            placeholder="Add a tag… (Enter or comma)"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                        />
                        <button type="button" className="tag-add-btn" onClick={addTag}>Add</button>
                    </div>

                    {error && <p className="create-post-error">{error}</p>}

                    <div className="create-post-actions">
                        <button type="button" className="create-post-cancel" onClick={handleCancel} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}>
                            {submitting ? "Posting…" : "Share"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreatePostForm;
