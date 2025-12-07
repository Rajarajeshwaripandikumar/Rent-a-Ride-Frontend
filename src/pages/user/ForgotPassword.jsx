// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "" // dev: proxy to backend (vite proxy) or same origin
    : import.meta.env.VITE_PRODUCTION_BACKEND_URL || "";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSend = async () => {
    if (!email || !isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // try to parse JSON if present
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // ignore parse errors; we'll handle by status
      }

      if (!res.ok) {
        const msg = data?.message || `Failed to send reset link (${res.status})`;
        toast.error(msg);
      } else {
        toast.success(data?.message || "Reset link sent. Check your email.");
        // short pause so user sees toast, then route to signin
        setTimeout(() => navigate("/signin"), 1200);
      }
    } catch (err) {
      console.error("ForgotPassword error:", err);
      toast.error(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7FB] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your email and we'll send a password reset link.
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 mb-4"
            aria-label="Email"
            autoComplete="email"
            required
            disabled={loading}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-slate-400"
            aria-busy={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            onClick={() => navigate("/signin")}
            className="w-full mt-4 text-blue-600 hover:underline"
            type="button"
            disabled={loading}
          >
            Back to Login
          </button>
        </div>
      </div>
    </>
  );
}
