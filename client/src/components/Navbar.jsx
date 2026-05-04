import { useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../utils/axios";

const Navbar = ({ setUser, cartCount = 0, showCart = true }) => {
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
        <nav className="sticky top-0 z-50 border-b border-orange-100 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">🍬</span>
                    <span className="text-xl font-bold text-slate-900">Sweet Shop</span>
                </div>

                <div className="flex items-center gap-4">
                    {showCart && (
                        <button
                            onClick={() => navigate("/cart")}
                            className="relative inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-orange-600 transition hover:bg-orange-100"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
