import { useEffect, useState } from "react";
import { api } from "../utils/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [sweetsMap, setSweetsMap] = useState({});
  const navigate = useNavigate();

  /* -------------------------------------------------------------------------- */
  /*                               LOCAL STORAGE                                */
  /* -------------------------------------------------------------------------- */

  const getCart = () => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  };

  const saveCart = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(cart);
  };

  /* -------------------------------------------------------------------------- */
  /*                              INITIAL LOAD                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const loadCartAndSweets = async () => {
      try {
        const cart = getCart();
        setCartItems(cart);

        // Fetch all sweets to get latest stock & prices
        const res = await api.get("/api/sweets");

        // Convert sweets array to map for quick lookup
        const map = {};
        res.data.forEach((s) => {
          map[s._id] = s;
        });

        setSweetsMap(map);
      } catch {
        toast.error("Failed to load cart");
      }
    };

    loadCartAndSweets();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                            CART QUANTITY CONTROLS                          */
  /* -------------------------------------------------------------------------- */

  const increaseQty = (id) => {
    const cart = [...cartItems];
    const item = cart.find((i) => i.id === id);
    const sweet = sweetsMap[id];

    if (!item || !sweet) return;
    if (item.quantity >= sweet.quantity) return;

    item.quantity += 1;
    saveCart(cart);
  };

  const decreaseQty = (id) => {
    let cart = [...cartItems];
    const item = cart.find((i) => i.id === id);

    if (!item) return;

    item.quantity -= 1;

    if (item.quantity === 0) {
      cart = cart.filter((i) => i.id !== id);
    }

    saveCart(cart);
  };

  /* -------------------------------------------------------------------------- */
  /*                               CART PURCHASE                                 */
  /* -------------------------------------------------------------------------- */

  const purchaseCart = async () => {
    if (cartItems.length === 0) {
      toast.info("Cart is empty");
      return;
    }

    try {
      await api.post("/api/sweets/cart-purchase", {
        cart: cartItems,
      });

      toast.success("Purchase successful");

      // Clear cart after successful purchase
      localStorage.removeItem("cart");
      setCartItems([]);

      navigate("/sweets");
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                CALCULATIONS                                */
  /* -------------------------------------------------------------------------- */

  const totalPrice = cartItems.reduce((sum, item) => {
    const sweet = sweetsMap[item.id];
    return sweet ? sum + sweet.price * item.quantity : sum;
  }, 0);

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const sweet = sweetsMap[item.id];
                if (!sweet) return null;

                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl shadow flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{sweet.name}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{sweet.price} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="px-3 py-1 border rounded text-orange-500"
                      >
                        −
                      </button>

                      <span className="font-semibold">{item.quantity}</span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        disabled={item.quantity >= sweet.quantity}
                        className="px-3 py-1 border rounded text-orange-500 disabled:text-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>

              <button
                onClick={purchaseCart}
                className="mt-4 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
              >
                Purchase Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
