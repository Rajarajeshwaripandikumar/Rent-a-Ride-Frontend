// src/components/UserProfileContent.jsx
import { useDispatch, useSelector } from "react-redux";
import ProfileEdit from "../pages/user/ProfileEdit";
import toast, { Toaster } from "react-hot-toast";
import { setUpdated } from "../redux/user/userSlice";
import { useEffect, useState, useRef } from "react";

/**
 * Helper: safely add/update query param 'v' for cache-busting.
 * - Avoids mutating non-http URLs (data:, blob:)
 * - Uses URL API to avoid producing malformed query strings
 * - Falls back to safe string concat if URL constructor fails
 */
function makeCacheBustedUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
  // don't modify data/blob URIs
  if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) return rawUrl;

  try {
    const u = new URL(rawUrl);
    u.searchParams.set("v", String(Date.now()));
    return u.toString();
  } catch (err) {
    // fallback if URL parsing fails (rare)
    if (rawUrl.includes("?")) return `${rawUrl}&v=${Date.now()}`;
    return `${rawUrl}?v=${Date.now()}`;
  }
}

const UserProfileContent = () => {
  const { email, username, profilePicture, phoneNumber, adress } = useSelector(
    (state) => state.user.currentUser || {}
  );
  const isUpdated = useSelector((state) => state.user.isUpdated);
  const dispatch = useDispatch();

  // visibleSrc = currently-rendered image URL
  const [visibleSrc, setVisibleSrc] = useState(profilePicture || "/placeholder-avatar.png");
  // stagingSrc = URL we're preloading (contains cache-bust)
  const stagingRef = useRef(null);
  // controls fade animation
  const [isFading, setIsFading] = useState(false);

  // sync initial profilePicture
  useEffect(() => {
    if (!profilePicture) {
      setVisibleSrc("/placeholder-avatar.png");
      return;
    }
    // If first render or no staged update, just set visible directly (no flicker)
    if (!stagingRef.current) {
      setVisibleSrc(profilePicture);
    }
  }, [profilePicture]);

  // When an update occurs, preload the new image then swap in smoothly
  useEffect(() => {
    if (!isUpdated) return;

    // toast as before
    toast.success("Successfully updated");

    // if there's no profilePicture in store, just reset flag
    if (!profilePicture) {
      dispatch(setUpdated(false));
      return;
    }

    // create a safe cache-busted URL to force fetch
    const busted = makeCacheBustedUrl(profilePicture);
    stagingRef.current = busted;

    // preload
    const img = new Image();
    let didCancel = false;

    img.onload = () => {
      if (didCancel) return;
      // fade out -> swap -> fade in
      setIsFading(true);

      // wait for fade-out (180ms), then set the new visible src, then clear fade
      setTimeout(() => {
        setVisibleSrc(busted);
        setIsFading(false);
        stagingRef.current = null;
        // reset your global flag so the old toast logic remains unchanged
        dispatch(setUpdated(false));
      }, 180); // match CSS transition-duration
    };

    img.onerror = () => {
      // if preload fails, don't blink — just keep existing visibleSrc
      stagingRef.current = null;
      dispatch(setUpdated(false));
      // optional: show toast of failure
      // toast.error("Failed to load updated profile image");
    };

    // start loading
    img.src = busted;

    return () => {
      didCancel = true;
    };
  }, [isUpdated, profilePicture, dispatch]);

  return (
    <div className="px-4 mx-auto mt-10 w-full sm:px-6 lg:px-8 flex justify-center">
      <Toaster />
      <div className="w-full max-w-[700px] bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* --- HEADER --- */}
        <div className="p-6 flex gap-4 items-center">
          {/* Avatar */}
          <div
            className="h-[90px] w-[90px] rounded-full border border-gray-200 shadow-sm overflow-hidden bg-gray-50"
            style={{ position: "relative" }}
          >
            <img
              src={visibleSrc}
              alt="profile"
              className={`w-full h-full object-cover transition-opacity duration-150 ${isFading ? "opacity-40" : "opacity-100"}`}
              onError={(e) => {
                e.currentTarget.src = "/placeholder-avatar.png";
              }}
            />
          </div>

          {/* Name + Email */}
          <div className="flex-1">
            <h3 className="text-[22px] font-semibold text-gray-900">{username}</h3>
            <p className="text-[14px] text-gray-500">{email}</p>
          </div>

          {/* Edit Button */}
          <ProfileEdit />
        </div>

        <div className="border-t border-gray-200"></div>

        {/* --- BODY --- */}
        <div className="px-6 py-6 flex flex-col gap-6">
          <div>
            <h4 className="text-[15px] font-semibold text-gray-900">User Information</h4>
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 flex flex-col gap-4">
              {/* Phone */}
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Phone</span>
                <span className="text-gray-900 font-medium text-sm">
                  {phoneNumber || "-"}
                </span>
              </div>

              {/* Address */}
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Address</span>
                <span className="text-gray-900 font-medium text-sm max-w-[260px] text-right">
                  {adress || "-"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            Keep your contact details up-to-date for a smooth rental experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileContent;
