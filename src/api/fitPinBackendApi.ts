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