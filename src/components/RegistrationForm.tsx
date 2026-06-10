
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

    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);

	const handleSubmit = async () => {
		setError("");
		try {
			await registerUser(formData);
			setSuccess(true);
		} catch (err) {
			setError((err as any).response?.data?.message ?? "Something went wrong");
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

				{success && (
				<p className="reg-message reg-message-success">
					Account created successfully! You can now log in.
				</p>
			)}
			{error && <p className="reg-message reg-message-error">{error}</p>}
			<label className="auth-label" htmlFor="username">Username</label>
			<input
				id="username"
				name="username"
				type="text"
				placeholder="Username"
				value={formData.username}
				onChange={handleChange}
				disabled={success}
			/>

			<label className="auth-label" htmlFor="emailAddress">Email</label>
			<input
				id="emailAddress"
				name="emailAddress"
				type="email"
				placeholder="Email"
				value={formData.emailAddress}
				onChange={handleChange}
				disabled={success}
			/>

			<label className="auth-label" htmlFor="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				placeholder="Password"
				value={formData.password}
				onChange={handleChange}
				disabled={success}
			/>

			<button onClick={handleSubmit} disabled={success}>Register</button>

			<p className="auth-switch">
				Already have an account? <Link to="/login">Log in here</Link>
			</p>

		</div>
	)
}

export default RegistrationForm;