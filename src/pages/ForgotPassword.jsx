import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../server";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const primary = "#622F10";
  const hoverPrimary = "#8B4A23";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(response.message || "Link reset password telah dikirim ke email Anda");
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col gap-4"
      >
        <h2 className="text-3xl font-bold text-[#622F10] text-center mb-4 sm:mb-6">
          Reset Password
        </h2>

        {message && (
          <p className="text-green-600 bg-green-100 p-3 rounded-xl text-center text-sm">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-500 bg-red-100 p-3 rounded-xl text-center text-sm">
            {error}
          </p>
        )}

        <p className="text-gray-600 text-center text-sm mb-4">
          Masukkan email Anda untuk menerima link reset password
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#622F10] transition-all placeholder-gray-400"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 mt-2 rounded-2xl bg-[#622F10] hover:bg-[#8B4A23] text-white font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengirim...
            </>
          ) : (
            "Kirim Link Reset Password"
          )}
        </button>

        <div className="flex flex-col gap-2 mt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={loading}
            className="w-full py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
          >
            Kembali ke Login
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          &copy; 2025 remen coffee
        </p>
      </form>
    </div>
  );
}