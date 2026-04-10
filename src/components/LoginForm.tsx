import React from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../api/fitPinBackendApi";
import './RegistrationForm.css';

function LoginForm() {
    const [formData, setFormData] = React.useState({
        emailOrUsername: "",
        password: ""
    });

    const [message, setMessage] = React.useState("");

    const handleSubmit = async () => {
        try {
            const response = await loginUser(formData);
            setMessage("Login successful!");
            console.log("Login successful:", response);
        } catch (error) {
            setMessage(error.response?.data?.message ?? "Something went wrong");
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
            {message && <p>{message}</p>}
            <input
                name="emailOrUsername"
                type="text"
                placeholder="Email or Username"
                value={formData.emailOrUsername}
                onChange={handleChange}
            />
            <input
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