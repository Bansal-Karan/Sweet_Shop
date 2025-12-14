import { useEffect, useState } from "react";
import { api } from "../utils/axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);

  // add sweet form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    image: null,
  });

  // fetch sweets
  const fetchSweets = async () => {
    try {
      const res = await api.get("/api/sweets");
      setSweets(res.data);
    } catch {
      toast.error("Failed to load sweets");
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  // add sweet
  const handleAddSweet = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));

      await api.post("/api/sweets", data);
      toast.success("Sweet added");
      setForm({ name: "", category: "", price: "", quantity: "", image: null });
      fetchSweets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  // delete sweet
  const handleDelete = async (id) => {
    if (!confirm("Delete this sweet?")) return;

    try {
      await api.delete(`/api/sweets/${id}`);
      toast.success("Sweet deleted");
      fetchSweets();
    } catch {
      toast.error("Delete failed");
    }
  };

  // restock sweet
  const handleRestock = async (id) => {
    const qty = prompt("Enter restock quantity");
    if (!qty || qty <= 0) return;

    try {
      await api.post(`/api/sweets/${id}/restock`, {
        quantity: Number(qty),
      });
      toast.success("Restocked");
      fetchSweets();
    } catch {
      toast.error("Restock failed");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Add Sweet */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-bold text-orange-500 mb-4">
            Add New Sweet
          </h2>

          <form
            onSubmit={handleAddSweet}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <input
              placeholder="Name"
              className="border p-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Category"
              className="border p-2 rounded"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Price"
              className="border p-2 rounded"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              className="border p-2 rounded"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <input
              type="file"
              className="border p-2 rounded"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
              required
            />

            <button
              disabled={loading}
              className="md:col-span-5 bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
            >
              {loading ? "Adding..." : "Add Sweet"}
            </button>
          </form>
        </div>

        {/* Sweet List */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-orange-500 mb-4">
            Existing Sweets
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-orange-100 text-left">
                  <th className="p-2">Image</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sweets.map((sweet) => (
                  <tr key={sweet._id} className="border-t">
                    <td className="p-2">
                      <img
                        src={sweet.imageUri}
                        alt={sweet.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    </td>
                    <td className="p-2">{sweet.name}</td>
                    <td className="p-2">{sweet.category}</td>
                    <td className="p-2">₹{sweet.price}</td>
                    <td className="p-2">{sweet.quantity}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleRestock(sweet._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => handleDelete(sweet._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sweets.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                No sweets available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
