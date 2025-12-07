// src/pages/vendor/VendorSignup.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../..";
import VendorOAuth from "../../../components/VendorAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "sonner";
import { FaCarSide } from "react-icons/fa";

const schema = z.object({
  username: z.string().min(3, { message: "minimum 3 characters required" }),
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
  password: z.string().min(4, { message: "minimum 4 characters required" }),
});

// ✅ Same base URL logic as SignIn / SignUp / VendorSignin / AdminSignin
const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : (import.meta.env.VITE_PRODUCTION_BACKEND_URL &&
        import.meta.env.VITE_PRODUCTION_BACKEND_URL.replace(/\/+$/, "")) ||
      "https://rent-a-ride-backend-c2km.onrender.com";

export default function VendorSignup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const [isError, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // reset local states when mounted
    setError(null);
    setLoading(false);
  }, []);

  const onSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/vendor/vendorsignup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // ignore JSON parse errors, we'll handle via res.ok
      }

      if (!res.ok || data?.succes === false || data?.success === false) {
        const msg = data?.message || "Signup failed";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success(data?.message || "Signup successful — please sign in");
      setLoading(false);
      navigate("/vendorsignin");
    } catch (err) {
      console.error("Vendor signup error:", err);
      setError("Network error");
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#EEF2FF] border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div>
                <h1
                  className={`${styles.heading2} text-lg font-semibold text-gray-900`}
                >
                  Vendor Sign Up
                </h1>
              </div>
            </div>

            <Link to="/">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </Link>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-6 space-y-4"
          >
            <div>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
              />
            </div>

            <div>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </div>

            <div>
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400 transition shadow-sm"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>

            {isError && (
              <p className="text-red-600 text-[13px] mt-1">
                {typeof isError === "string"
                  ? isError
                  : isError?.message || "Something went wrong"}
              </p>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 pt-2">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-[12px] text-gray-500">OR</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-600 pt-4 pb-2">
              Already have an account?{" "}
              <Link
                to="/vendorsignin"
                className="text-blue-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
