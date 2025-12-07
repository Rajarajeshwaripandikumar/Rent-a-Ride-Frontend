import { useState } from "react";
import styles from "../../index";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../../components/OAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "sonner";

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

/**
 * Backend base URL:
 * - DEV  -> http://localhost:5000
 * - PROD -> VITE_PRODUCTION_BACKEND_URL (Netlify env)
 *           or fallback to Render URL
 */
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : (import.meta.env.VITE_PRODUCTION_BACKEND_URL &&
        import.meta.env.VITE_PRODUCTION_BACKEND_URL.replace(/\/+$/, "")) ||
      "https://rent-a-ride-backend-c2km.onrender.com";

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);
      setLoading(false);

      if (!res.ok || data?.succes === false || data?.success === false) {
        toast.error(data?.message || "Signup failed");
        return;
      }

      toast.success("Account created. Redirecting to Sign in...");
      navigate("/signin");
    } catch (error) {
      setLoading(false);
      toast.error(error?.message || "Network error");
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
        <main className="flex-grow w-full px-4 sm:px-10 lg:px-20 xl:px-[120px] xl:pl-[100px] py-10 flex items-center justify-center">
          <div className="mx-auto w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#EEF2FF] border-b border-gray-200 flex justify-between items-center">
              <h1
                className={`${styles.heading2} text-lg font-semibold text-gray-900`}
              >
                Create an account
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
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="px-6 py-6 space-y-4"
            >
              <div>
                <TextField
                  id="username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  defaultValue=""
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              </div>

              <div>
                <TextField
                  id="email"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  defaultValue=""
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
                  defaultValue=""
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white disabled:bg-slate-400 hover:bg-blue-700 transition shadow-sm"
              >
                {isLoading ? "Loading ..." : "Register"}
              </button>

              <p className="text-[12px] text-gray-600 pt-2">
                Have an account?{" "}
                <Link
                  to="/signin"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-4">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="h-px flex-1 bg-gray-200" />
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignUp;
