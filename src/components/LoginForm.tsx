import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/fitPinBackendApi";
import './RegistrationForm.css';

function LoginForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        emailOrUsername: "",
        password: ""
    });

    const [message, setMessage] = React.useState("");

    const handleSubmit = async () => {
        try {
            const response = await loginUser(formData);
            console.log("Login successful:", response);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", response.username);
            localStorage.setItem("userId", String(response.userId));
            localStorage.setItem("profilePictureUrl", response.profilePictureUrl ?? "");
            navigate("/");
        } catch (error) {
            setMessage((error as any).response?.data?.message ?? "Something went wrong");
            console.log("Login failed:", error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }


    return (
        <div className="registration-card">
            <h2>Login</h2>
            {message && <p className="reg-message reg-message-error">{message}</p>}
            <label className="auth-label" htmlFor="emailOrUsername">Email or Username</label>
            <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                placeholder="Email or Username"
                value={formData.emailOrUsername}
                onChange={handleChange}
            />
            <label className="auth-label" htmlFor="password">Password</label>
            <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
            />
            <button onClick={handleSubmit}>Login</button>

            <p className="auth-switch">
                Don't have an account yet? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default LoginForm;