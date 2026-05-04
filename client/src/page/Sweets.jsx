import { useEffect, useState } from "react";
import { api } from "../utils/axios";
import { toast } from "react-toastify";
import { ShoppingCart, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Sweets = ({ setUser }) => {
  const [sweets, setSweets] = useState([]);
  const [cartVersion, setCartVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);

  const fetchSweets = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(
        keyword.trim() === ""
          ? "/api/sweets"
          : `/api/sweets/search?keyword=${encodeURIComponent(keyword)}`
      );
      setSweets(res.data);
    } catch {
      toast.error("Unable to load sweets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

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
    setCartVersion((v) => v + 1);
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
    setCartVersion((v) => v + 1);
  };

  const purchaseSweet = async (id) => {
    try {
      await api.post(`/api/sweets/${id}/purchase`, { quantity: 1 });
      toast.success("Purchased successfully");
      fetchSweets(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed");
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchSweets(value);
  };

  const clearSearch = () => {
    setSearch("");
    fetchSweets("");
  };

  const noResults = !loading && sweets.length === 0;

  return (
    <>
      <Navbar setUser={setUser} cartCount={cartCount} showCart={true} />

      <div className="min-h-screen bg-linear-to-b from-orange-50 via-orange-50 to-orange-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="rounded-4xl border border-orange-100 bg-white/80 p-6 shadow-lg shadow-orange-100/40 backdrop-blur-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-500">
                  Sweet shop
                </p>
                <h1 className="text-4xl font-extrabold text-slate-900">Your Sweet Shop Dashboard</h1>
                <p className="max-w-2xl text-base text-slate-600">
                  Quickly browse sweets, add favorites to cart, and checkout with ease. Everything you need is available in one polished experience.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:justify-items-end">
                <div className="rounded-3xl border border-orange-100 bg-orange-50 px-5 py-4 text-center shadow-sm">
                  <p className="text-sm text-slate-500">Total sweets</p>
                  <p className="mt-2 text-3xl font-bold text-orange-600">{sweets.length}</p>
                </div>
                <div className="rounded-3xl border border-orange-100 bg-white px-5 py-4 text-center shadow-sm">
                  <p className="text-sm text-slate-500">Items in cart</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{cartCount}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-3xl bg-orange-50 px-4 py-3 text-orange-600 shadow-sm">
                <Search className="h-5 w-5" />
                <span className="font-semibold">Search products</span>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search sweets by name or category..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-5 py-4 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {search.trim() !== "" && (
                <button
                  onClick={clearSearch}
                  className="rounded-3xl border border-orange-200 bg-white px-5 py-4 text-orange-600 transition hover:bg-orange-50"
                >
                  Clear search
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <p>{noResults ? "No results found" : ""}</p>
              {search.trim() !== "" && <span className="text-orange-500">for "{search}"</span>}
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sweets.map((sweet) => {
              const quantity = sweet.quantity || 0;
              const inCart = getCartQty(sweet._id) > 0;
              return (
                <div
                  key={sweet._id}
                  className="group overflow-hidden rounded-4xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={sweet.imageUri}
                      alt={sweet.name}
                      className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 shadow-sm">
                      {sweet.category}
                    </div>
                    <div className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${quantity > 10 ? "bg-emerald-100 text-emerald-700" : quantity > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-800 text-white"}`}>
                      {quantity > 0 ? `${quantity} in stock` : "Sold out"}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-900">{sweet.name}</h3>
                      <p className="text-sm text-slate-500 min-h-10">
                        A delicious sweet treat perfect for every celebration.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Price</p>
                        <p className="text-2xl font-bold text-orange-600">₹{sweet.price}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <button
                        disabled={quantity === 0}
                        onClick={() => purchaseSweet(sweet._id)}
                        className="rounded-3xl bg-orange-500 px-4 py-3 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-200"
                      >
                        {quantity === 0 ? "Sold out" : "Buy now"}
                      </button>

                      <div className="flex items-center gap-2 rounded-3xl border border-orange-100 bg-orange-50 p-2">
                        {inCart ? (
                          <>
                            <button
                              onClick={() => decreaseQty(sweet._id)}
                              className="rounded-full bg-white px-3 py-2 text-orange-600 shadow-sm transition hover:bg-orange-100"
                            >
                              −
                            </button>
                            <span className="flex-1 text-center font-semibold text-slate-900">{getCartQty(sweet._id)}</span>
                            <button
                              onClick={() => increaseQty(sweet)}
                              disabled={getCartQty(sweet._id) >= quantity}
                              className="rounded-full bg-white px-3 py-2 text-orange-600 shadow-sm transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              +
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => increaseQty(sweet)}
                            disabled={getCartQty(sweet._id) >= 1}
                            className="w-full rounded-3xl bg-white px-4 py-3 text-orange-600 shadow-sm transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            Add to cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {noResults && (
            <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
              <p className="text-xl font-semibold text-slate-900">No sweets found</p>
              <p className="mt-2 text-slate-500">Try another search term or clear your filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sweets;
