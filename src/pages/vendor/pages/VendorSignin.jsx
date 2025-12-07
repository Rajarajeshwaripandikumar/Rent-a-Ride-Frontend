// src/pages/vendor/VendorSignin.jsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
  resetAuthState,
} from "../../../redux/user/userSlice";
import styles from "../../..";
import VendorOAuth from "../../../components/VendorAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "sonner";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((v) => /\S+@\S+\.\S+/.test(v), {
      message: "Invalid email address",
    }),
  password: z.string().min(1, { message: "password required" }),
});

export default function VendorSignin() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const { isLoading, isError } = useSelector((state) => state.user || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/vendorDashboard";
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const onSubmit = async (formData) => {
    try {
      dispatch(signInStart());

      const res = await fetch(`${API_BASE}/api/vendor/vendorsignin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        toast.error("Invalid server response");
        dispatch(signInFailure({ message: "Invalid server response" }));
        return;
      }

      if (!res.ok || data.success === false || data.succes === false) {
        toast.error(data?.message || "Invalid email or password");
        dispatch(signInFailure({ message: data?.message }));
        return;
      }

      if (!data.isVendor) {
        toast.error("Not a vendor account");
        dispatch(signInFailure({ message: "Not a vendor account" }));
        return;
      }

      dispatch(signInSuccess(data));
      navigate(redirectTo, { replace: true });
    } catch {
      toast.error("Network error. Please try again.");
      dispatch(signInFailure({ message: "Network error" }));
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#EEF2FF] border-b border-gray-200">
            <h1 className={`${styles.heading2} text-lg font-semibold text-gray-900`}>
              Vendor Sign In
            </h1>

            <Link to="/">
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition">
                ✕
              </button>
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">

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

            {/* Forgot Password (points to user forgot page) */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")} // <-- updated to existing user route
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400 transition shadow-sm"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {isError && (
              <p className="text-red-600 text-[13px] mt-1">
                {isError.message || "Something went wrong"}
              </p>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 pt-4">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-[12px] text-gray-500">OR</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

          

            {/* Footer */}
            <p className="text-center text-sm text-gray-600 pt-4 pb-2">
              Don't have a vendor account?{" "}
              <Link to="/vendorsignup" className="text-blue-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
