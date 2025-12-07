// src/components/VendorOAuth.jsx
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // 👈 change here
import { auth } from "../firebase"; // 👈 use shared auth (like user OAuth)
import { signInFailure, signInSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Optional: handle dev / prod base URL same as others
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? ""
    : import.meta.env.VITE_PRODUCTION_BACKEND_URL || "";

function VendorOAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleVendorGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // ✅ use shared auth instance from src/firebase.js
      const result = await signInWithPopup(auth, provider);

      const res = await fetch(`${API_BASE_URL}/api/vendor/vendorgoogle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data) {
        dispatch(signInFailure(data || { message: "Vendor signin failed" }));
        toast.error(data?.message || "Vendor signin failed");
        navigate("/vendorSignin");
        return;
      }

      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

      dispatch(signInSuccess(data));
      toast.success("Signed in as vendor");
      navigate("/vendorDashboard");
    } catch (error) {
      console.error("could not login with google (vendor)", error);
      dispatch(signInFailure(error));
      toast.error(error?.message || "Vendor Google login failed");
    }
  };

  return (
    <div className="px-5">
      <button
        className="
          flex w-full gap-3 justify-center
          border border-black
          py-3 rounded-md items-center
          hover:bg-gray-50 transition
        "
        type="button"
        onClick={handleVendorGoogleClick}
      >
        <span className="icon-[devicon--google]" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
}

export default VendorOAuth;
