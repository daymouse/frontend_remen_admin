import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../server";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Login request
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      // 2. Ambil data user setelah login sukses
      const userData = await apiFetch("/auth/me", {
        method: "GET",
      });

      // 3. Update user state di App component
      if (setUser) {
        setUser(userData.user);
      }

      // 4. Navigasi berdasarkan role
      if (userData.user.is_admin == 1) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/petugas", { replace: true });
      }
    }catch (err) {
      setError(err.message);
    }

  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col gap-4"
      >
        <h2 className="text-3xl font-bold text-[#622F10] text-center mb-4 sm:mb-6">
          Remen Coffee 
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

          {/* Password Input dengan Toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10] transition-all placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Tambahkan tombol forgot password di sini */}
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-[#622F10] hover:text-[#8B4A23] transition-colors"
          >
            Lupa Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-2 rounded-2xl bg-[#622F10] hover:bg-[#8B4A23] text-white font-semibold shadow-md transition-all"
        >
          Login
        </button>

        {/* Tambahkan tombol register di sini */}
        <div className="flex items-center justify-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-sm text-gray-600 hover:text-[#622F10] transition-colors"
          >
            Belum punya akun? <span className="font-semibold">Daftar</span>
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-2">
          &copy; 2025 remen coffee
        </p>
      </form>
    </div>
  );
}