// src/pages/user/ResetPassword.jsx
import { useEffect, useState } from "react";
import styles from "../../index";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "sonner";

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? ""
    : import.meta.env.VITE_PRODUCTION_BACKEND_URL || "";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const tokenFromQuery = query.get("token") || "";
  const emailFromQuery = query.get("email") || "";

  const [token] = useState(tokenFromQuery);
  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("ResetPassword mounted", {
      pathname: window.location.pathname,
      search: window.location.search,
      token: tokenFromQuery,
      email: emailFromQuery,
    });

    if (!token || !emailFromQuery) {
      toast.warning(
        "Reset token or email missing. Please open the reset link from your email."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token. Use the link from your email.");
      return;
    }

    if (!emailFromQuery) {
      toast.error("Missing email. Use the link from your email.");
      return;
    }

    if (!password) {
      toast.error("Enter a new password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // ✅ send email, NOT id
      const payload = { token, email: emailFromQuery, password };

      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        // ignore parse error
      }

      if (!res.ok) {
        toast.error(
          data?.message || `Failed to reset password (${res.status})`
        );
        return;
      }

      toast.success(data?.message || "Password updated successfully");

      setTimeout(() => {
        navigate("/signin");
      }, 900);
    } catch (err) {
      console.error("ResetPassword error:", err);
      toast.error(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
        <main className="flex-grow w-full px-4 sm:px-10 lg:px-20 xl:px-[120px] xl:pl-[100px] py-10 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-[#EEF2FF] border-b border-gray-200">
              <h1
                className={`${styles.heading2} text-lg md:text-xl font-semibold text-gray-900`}
              >
                Reset Password
              </h1>
              <Link to="/">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                >
                  ✕
                </button>
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
              <div>
                <TextField
                  id="email"
                  label="Email (optional)"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  helperText="Optional — prefilled from your reset link"
                  InputProps={{ style: { padding: "12px 14px" } }}
                  disabled // ✅ keep it from being changed
                />
              </div>

              <div>
                <TextField
                  id="new-password"
                  label="New password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="At least 6 characters"
                  InputProps={{ style: { padding: "12px 14px" } }}
                />
              </div>

              <div>
                <TextField
                  id="confirm-password"
                  label="Confirm password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  InputProps={{ style: { padding: "12px 14px" } }}
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => navigate("/signin")}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={loading}
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400 transition shadow-sm"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>

              <div className="pt-3">
                <p className="text-[12px] text-center text-gray-500">
                  If the link looks invalid, request a new one{" "}
                  <Link
                    to="/forgot-password"
                    className="text-blue-600 hover:underline"
                  >
                    here
                  </Link>
                  .
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
