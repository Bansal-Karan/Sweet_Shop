import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-10 text-center">
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-500 mb-4">
          🍬 Welcome to Sweet Shop
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg md:text-xl mb-8">
          Discover delicious traditional sweets, freshly prepared and delivered
          with love.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/admin/login")}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-orange-600 transition shadow-md"
          >
            Admin
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border border-orange-500 text-orange-500 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-orange-50 transition"
          >
            User
          </button>
        </div>

        {/* Footer note */}
        <p className="text-sm text-gray-400 mt-10">
          Quality • Taste • Tradition
        </p>
      </div>
    </div>
  );
};

export default Home;