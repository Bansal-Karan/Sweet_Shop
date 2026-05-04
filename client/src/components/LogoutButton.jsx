import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../utils/axios";

const LogoutButton = ({ setUser }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (err) {
            console.error("Logout failed", err);
        }

        setUser(null);
        localStorage.removeItem("cart");
        toast.success("Logged out");
        navigate("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-white border border-orange-500 text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition"
        >
            Logout
        </button>
    );
};

export default LogoutButton;
