import apiClient from "./apiClient";

export type RegisterRequest = {
	username: string;
	emailAddress: string;
	password: string;
}

export type LoginRequest = {
	emailOrUsername: string;
    password: string;
}

export async function registerUser(data: RegisterRequest) {
	const response = await apiClient.post("/auth/register", data);
	return response.data;
}

export async function loginUser(data: LoginRequest) {
	const response = await apiClient.post("/auth/login", data);
	return response.data;
}


export async function getFeed() {
	const response = await apiClient.get("/posts");
	return response.data;
}

export type ProductDTO = {
	id: number;
	name: string;
	brand: { id: number; name: string };
	imageUrl: string | null;
}

export type PostResponseDTO = {
	id: number;
	publisherUsername: string;
	publisherProfilePictureUrl: string | null;
	timestamp: string;
	imageUrl: string;
	caption: string;
	likeCount: number;
	commentCount: number;
	likedByCurrentUser: boolean;
	tags: { id: number; name: string }[];
	products: ProductDTO[];
}

export type PostLikeResponse = {
	liked: boolean;
	likeCount: number;
}

export type CommentResponseDTO = {
	id: number;
	content: string;
	timestamp: string;
	authorUsername: string;
	authorProfilePictureUrl: string | null;
}

export async function likePost(postId: number): Promise<PostLikeResponse> {
	const response = await apiClient.post(`/posts/${postId}/likes`);
	return response.data;
}

export async function unlikePost(postId: number): Promise<PostLikeResponse> {
	const response = await apiClient.delete(`/posts/${postId}/likes`);
	return response.data;
}

export async function getComments(postId: number): Promise<CommentResponseDTO[]> {
	const response = await apiClient.get(`/posts/${postId}/comments`);
	return response.data;
}

export async function addComment(postId: number, content: string): Promise<CommentResponseDTO> {
	const response = await apiClient.post(`/posts/${postId}/comments`, { content });
	return response.data;
}

export async function deleteComment(postId: number, commentId: number): Promise<void> {
	await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
}

export async function deletePost(postId: number): Promise<void> {
	await apiClient.delete(`/posts/${postId}`);
}

export type NotificationResponseDTO = {
	id: number;
	type: "LIKE" | "COMMENT";
	timestamp: string;
	read: boolean;
	actorUsername: string;
	actorProfilePictureUrl: string | null;
	postId: number | null;
	postImageUrl: string | null;
}

export async function getNotifications(): Promise<NotificationResponseDTO[]> {
	const response = await apiClient.get("/notifications");
	return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
	const response = await apiClient.get("/notifications/unread-count");
	return response.data.count;
}

export async function markAllNotificationsAsRead(): Promise<void> {
	await apiClient.put("/notifications/read-all");
}

export type UserProfileResponse = {
	id: number;
	username: string;
	bio: string | null;
	profilePictureUrl: string | null;
	postCount: number;
}

export type UpdateProfileRequest = {
	bio?: string;
	profilePictureUrl?: string;
}

export async function getProducts(): Promise<ProductDTO[]> {
	const response = await apiClient.get("/products");
	return response.data;
}

export async function getUserProfile(username: string): Promise<UserProfileResponse> {
	const response = await apiClient.get(`/users/${username}`);
	return response.data;
}

export async function getUserPosts(username: string): Promise<PostResponseDTO[]> {
	const response = await apiClient.get(`/users/${username}/posts`);
	return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
	const response = await apiClient.put('/users/me', data);
	return response.data;
}

export type CreatePostRequest = {
	imageUrl: string;
	caption?: string;
	productIds?: number[];
	tagNames?: string[];
}

export async function createPost(data: CreatePostRequest) {
	const response = await apiClient.post("/posts", data);
	return response.data;
}