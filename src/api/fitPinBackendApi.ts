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
	tags: { id: number; name: string }[];
	products: ProductDTO[];
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