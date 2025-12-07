// src/components/OAuth.jsx
import React from "react";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";

import {
  signInStart,
  signInFailure,
  signInSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // If VITE_API_URL is set (e.g. https://api.example.com), use it.
  // Otherwise, use relative path so Vite proxy /api -> backend works.
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // Helper: decide where to go based on role + current page
  const handlePostLoginRedirect = (role) => {
    const roleLower = String(role || "user").toLowerCase();

    // If you ONLY support Google/Facebook for normal users:
    // If user somehow tries this on /vendor-login, send them to user home.
    if (roleLower === "admin") {
      // Optional: you might NOT want social login for admin at all.
      navigate("/admin");
    } else if (roleLower === "vendor") {
      // Optional: block vendor social login or redirect as you wish.
      navigate("/vendor");
    } else {
      // default: normal user
      navigate("/");
    }
  };

  // ---------------------------------------------
  // COMMON HANDLER FOR GOOGLE / FACEBOOK RESPONSE
  // ---------------------------------------------
  const handleFirebaseResponse = async (res, providerName) => {
    const data = await res.json();
    console.log(`🔥 ${providerName} /api/auth/firebase response:`, data);

    // Expected shape from backend:
    // { token: <accessToken>, user: { ...userDoc, role: 'user' } }
    if (res.ok && data.token && data.user) {
      try {
        // align with normal login: store `accessToken`
        localStorage.setItem("accessToken", data.token);
      } catch (err) {
        console.warn("Failed to save accessToken to localStorage:", err);
      }

      dispatch(
        signInSuccess({
          token: data.token,
          user: data.user, // 🔥 store actual user object, not whole data
        })
      );

      handlePostLoginRedirect(data.user.role);
    } else {
      dispatch(
        signInFailure(
          data?.message ||
            `Firebase auth failed on backend (${providerName})`
        )
      );
    }
  };

  // ---------------------------------------------
  // GOOGLE LOGIN
  // ---------------------------------------------
  const handleGoogleClick = async () => {
    try {
      dispatch(signInStart());

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${apiUrl}/api/auth/firebase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        credentials: "include", // send / receive cookies (access_token)
        body: JSON.stringify({}),
      });

      await handleFirebaseResponse(res, "Google");
    } catch (error) {
      console.error("Could not login with Google:", error);
      dispatch(
        signInFailure(error?.message || "Google sign-in failed")
      );
    }
  };

  // ---------------------------------------------
  // FACEBOOK LOGIN
  // ---------------------------------------------
  const handleFacebookClick = async () => {
    try {
      dispatch(signInStart());

      const provider = new FacebookAuthProvider();
      provider.addScope("email");

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${apiUrl}/api/auth/firebase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        credentials: "include",
        body: JSON.stringify({}),
      });

      await handleFirebaseResponse(res, "Facebook");
    } catch (error) {
      console.error("Could not login with Facebook:", error);
      dispatch(
        signInFailure(error?.message || "Facebook sign-in failed")
      );
    }
  };

  return (
    <div className="w-full px-4 sm:px-5 flex flex-col gap-3">
      {/* GOOGLE BUTTON */}
      <button
        type="button"
        onClick={handleGoogleClick}
        className="flex w-full items-center justify-center gap-3
        rounded-xl border border-slate-300 bg-white py-2.5
        text-sm font-medium text-slate-800 shadow-sm
        hover:bg-slate-50 active:translate-y-[1px] transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
          <path
            fill="#4285F4"
            d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.4H272v95.3h146.9..."
          />
          <path fill="#34A853" d="M272 544.3c73.6..." />
          <path fill="#FBBC05" d="M118 328.9c-8.9..." />
          <path fill="#EA4335" d="M272 107.3c39.9..." />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* FACEBOOK BUTTON */}
      <button
        type="button"
        onClick={handleFacebookClick}
        className="flex w-full items-center justify-center gap-3
        rounded-xl bg-[#1877F2] border border-[#1877F2]
        py-2.5 text-sm font-medium text-white shadow-sm
        hover:bg-[#145bcc] active:translate-y-[1px] transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12.07C22 6.507..." />
        </svg>
        <span>Continue with Facebook</span>
      </button>
    </div>
  );
}

export default OAuth;
