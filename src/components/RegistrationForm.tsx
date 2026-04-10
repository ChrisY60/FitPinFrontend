
import type { RegisterRequest } from "../api/fitPinBackendApi";
import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/fitPinBackendApi";
import './RegistrationForm.css';
function RegistrationForm (){
	const [formData, setFormData] = useState<RegisterRequest>({
		username: "",
		emailAddress: "",
		password: "",
	});

    const [message, setMessage] = useState<string>("");

	const handleSubmit = async () => {
		try {
			const response = await registerUser(formData);
			console.log("Registration successful:", response);
		} catch (error) {
			setMessage(error.response?.data?.message ?? "Something went wrong");
			console.log("Registration failed:", error);
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};


	return ( 
		<div className="registration-card">

			<h2>Register</h2>

			{message && <p>{message}</p>}
			<input
				name="username"
				type="text"
				placeholder="Username"
				value={formData.username}
				onChange={handleChange}
			/>


			<input 
				name="emailAddress"
				type="email"
				placeholder="Email"
				value={formData.emailAddress}
				onChange={handleChange}
			/>

			<input
				name="password"
				type="password"
				placeholder="password"
				value={formData.password}
				onChange={handleChange}
			/>

			<button onClick={handleSubmit}>Register</button>

			<p className="auth-switch">
				Already have an account? <Link to="/login">Log in here</Link>
			</p>

		</div>
	)
}

export default RegistrationForm;