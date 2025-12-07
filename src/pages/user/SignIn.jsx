import { useEffect } from "react";
import styles from "../../index";
import { Link, useNavigate } from "react-router-dom";
import {
  loadingEnd,
  signInFailure,
  signInStart,
  signInSuccess,
  resetAuthState,
} from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../../components/OAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "sonner";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
  password: z.string().min(1, { message: "password required" }),
});

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? ""
    : import.meta.env.VITE_PRODUCTION_BACKEND_URL;

function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const { isLoading, isError } = useSelector((state) => state.user || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const onSubmit = async (formData) => {
    try {
      dispatch(signInStart());

      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      // Accept both `success` and common misspelling `succes` from backend
      const failed =
        !res.ok || !data || data.success === false || data.succes === false;

      if (failed) {
        dispatch(loadingEnd());
        dispatch(signInFailure(data || { message: "Signin failed" }));
        toast.error(data?.message || "Signin failed");
        return;
      }

      // 🔒 NEW: block admin/vendor login on NORMAL SignIn page
      if (data.isAdmin || data.isVendor) {
        const msg = "Admins must sign in using the Admin Sign In page.";
        dispatch(signInFailure({ message: msg }));
        dispatch(loadingEnd());
        toast.error(msg);
        return;
      }

      // Save tokens if present
      if (data?.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data?.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      dispatch(signInSuccess(data));
      dispatch(loadingEnd());

      // Redirect based on role flags from backend
      if (data.isUser) {
        navigate("/");
      } else {
        // unknown role (not admin/vendor, not user)
        const msg = "Unknown user role";
        dispatch(signInFailure({ message: msg }));
        toast.error(msg);
      }
    } catch (error) {
      dispatch(loadingEnd());
      dispatch(signInFailure(error));
      toast.error(error?.message || "Network error");
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
        <main className="flex-grow w-full px-4 sm:px-10 lg:px-20 xl:px-[120px] xl:pl-[100px] py-10 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#EEF2FF] border-b border-gray-200">
              <h1 className={`${styles.heading2} text-lg font-semibold text-gray-900`}>
                Sign in to your account
              </h1>
              <Link to="/" onClick={() => dispatch(loadingEnd())}>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                >
                  ✕
                </button>
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
              <div>
                <TextField
                  id="email"
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
                  id="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </div>

              {/* Forgot Password Link (aligned right, small) */}
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
                {isLoading ? "Loading ..." : "Login"}
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

              {/* Footer text */}
              <p className="text-center text-sm text-gray-600 pt-4 pb-2">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-blue-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignIn;
