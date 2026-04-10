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
	const response = await apiClient.post("/users/register", data);
	return response.data;
}

export async function loginUser(data: LoginRequest) {
	const response = await apiClient.post("/users/login", data);
	return response.data;
}
