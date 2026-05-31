import { useNavigate } from "react-router-dom";

function ProfilePage() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") ?? "Unknown";

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <div>
            <p>Logged in as: {username}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default ProfilePage;
