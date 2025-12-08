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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "sonner";
import { api } from "../../../api"; // ✅ use your centralized api.js

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .refine((v) => /\S+@\S+\.\S+/.test(v), {
      message: "Invalid email address",
    }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function VendorSignin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { isLoading, isError } = useSelector((state) => state.user || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/vendorDashboard";

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const onSubmit = async (formData) => {
    try {
      dispatch(signInStart());

      // ✅ use api.post – it already adds base URL, JSON, token, cookies
      const data = await api.post("/api/vendor/vendorsignin", formData);

      // Optional: log once to see shape
      // console.log("Vendor signin response:", data);

      if (!data.isVendor) {
        toast.error("Not a vendor account");
        dispatch(signInFailure({ message: "Not a vendor account" }));
        return;
      }

      // ✅ Normalise token names:
      // backend might send `accessToken` or `token`
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      dispatch(signInSuccess(data));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Vendor signin error:", error);

      const message =
        error?.data?.message ||
        error?.message ||
        "Network error. Please try again.";

      toast.error(message);
      dispatch(signInFailure({ message }));
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#EEF2FF] border-b border-gray-200">
            <h1
              className={`${styles.heading2} text-lg font-semibold text-gray-900`}
            >
              Vendor Sign In
            </h1>

            <Link to="/">
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition">
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

            {/* Forgot Password */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
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
                {typeof isError === "string"
                  ? isError
                  : isError?.message || "Something went wrong"}
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
              Don&apos;t have a vendor account?{" "}
              <Link
                to="/vendorsignup"
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
