import { useEffect, useState } from "react";
import { api } from "../utils/axios";
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sweets = () => {
  const [sweets, setSweets] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [cartVersion, setCartVersion] = useState(0);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* ------------------------------ FETCH SWEETS ------------------------------ */

  const handleSearch = async (value) => {
    setSearch(value);

    try {
      if (value.trim() === "") {
        const res = await api.get("/api/sweets");
        setSweets(res.data);
      } else {
        const res = await api.get(
          `/api/sweets/search?keyword=${value}`
        );
        setSweets(res.data);
      }
    } catch {
      toast.error("Search failed");
    }
  };


  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const res = await api.get("/api/sweets");
        setSweets(res.data);
      } catch {
        toast.error("Failed to load sweets");
      }
    };
    fetchSweets();
  }, []);

  /* --------------------------- CART (LOCAL STORAGE) -------------------------- */

  const getCart = () => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  };

  const getCartQty = (id) => {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const increaseQty = (sweet) => {
    const cart = getCart();
    const item = cart.find((i) => i.id === sweet._id);

    if (item) {
      if (item.quantity >= sweet.quantity) return;
      item.quantity += 1;
    } else {
      cart.push({ id: sweet._id, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartVersion((v) => v + 1); // trigger UI update
  };

  const decreaseQty = (id) => {
    let cart = getCart();
    const item = cart.find((i) => i.id === id);

    if (!item) return;

    item.quantity -= 1;

    if (item.quantity === 0) {
      cart = cart.filter((i) => i.id !== id);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartVersion((v) => v + 1); // trigger UI update
  };

  /* ------------------------------- PURCHASE -------------------------------- */

  const purchaseSweet = async (id) => {
    try {
      await api.post(`/api/sweets/${id}/purchase`, { quantity: 1 });
      toast.success("Purchased successfully");

      const res = await api.get("/api/sweets");
      setSweets(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed");
    }
  };

  /* -------------------------------- RENDER --------------------------------- */

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search sweets by name or category..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">
            Available Sweets
          </h1>

          <button
            onClick={() => navigate("/cart")}
            className="relative bg-white p-3 rounded-full shadow hover:bg-orange-100"
          >
            <ShoppingCart className="text-orange-500" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {getCart().length}
            </span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sweets.map((sweet) => (
            <div
              key={sweet._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={sweet.imageUri}
                alt={sweet.name}
                className="w-full h-40 object-cover"
              />

              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">{sweet.name}</h3>

                <p className="text-sm text-gray-600">
                  Stock: <span className="font-medium">{sweet.quantity}</span>
                </p>

                <p className="font-bold text-orange-500">₹{sweet.price}</p>

                <button
                  disabled={sweet.quantity === 0}
                  onClick={() => purchaseSweet(sweet._id)}
                  className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:bg-gray-300"
                >
                  Purchase
                </button>

                {/* Cart Controls */}
                <div className="flex items-center justify-between border border-orange-500 rounded">
                  {getCartQty(sweet._id) === 0 ? (
                    <button
                      onClick={() => increaseQty(sweet)}
                      disabled={sweet.quantity === 0}
                      className="w-full p-2 text-orange-500 font-semibold"
                    >
                      Add To Cart
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => decreaseQty(sweet._id)}
                        className="px-4 py-2 text-orange-500"
                      >
                        −
                      </button>

                      <span className="font-semibold">
                        {getCartQty(sweet._id)}
                      </span>

                      <button
                        onClick={() => increaseQty(sweet)}
                        disabled={getCartQty(sweet._id) >= sweet.quantity}
                        className="px-4 py-2 text-orange-500 disabled:text-gray-300"
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sweets.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No sweets available</p>
        )}
      </div>
    </div>
  );
};

export default Sweets;
