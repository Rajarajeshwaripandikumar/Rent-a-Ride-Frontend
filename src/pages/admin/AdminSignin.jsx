import { useState } from "react";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

function AdminSignin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      const user = data.user || data;

      if (user.role !== "admin" && !user.isAdmin) {
        throw new Error("Access denied: Not an admin account");
      }

      dispatch(signInSuccess(user));
      navigate("/adminDashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 border border-slate-200">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Admin Login</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your administrator account to access the dashboard.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-3 bg-red-50 border border-red-200 rounded-md py-2">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition shadow-sm"
          >
            Sign In
          </button>
        </form>

        {/* Admin Demo Credentials – Nice UI */}
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-blue-700 flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20H7a2 2 0 01-2-2v-1a5 5 0 0110 0v1a2 2 0 012 2z"
                />
              </svg>
              Demo Admin Login
            </h2>

            <div className="mt-3 text-center space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Email:</span>{" "}
                admin@example.com
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Password:</span>{" "}
                Admin@123
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Use these credentials to try the admin panel in demo mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignin;
