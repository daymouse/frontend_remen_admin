import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../server";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col gap-4"
      >
        <h2
          className="text-3xl font-bold text-[#622F10] text-center mb-4 sm:mb-6"
        >
          Admin Login
        </h2>

        {error && (
          <p className="text-red-500 bg-red-100 p-2 rounded text-center text-sm">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10] transition-all placeholder-gray-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10] transition-all placeholder-gray-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-2 rounded-2xl bg-[#622F10] hover:bg-[#8B4A23] text-white font-semibold shadow-md transition-all"
        >
          Login
        </button>

        <p className="text-center text-gray-400 text-sm mt-2">
          &copy; 2025 remen
        </p>
      </form>
    </div>
  );
}
