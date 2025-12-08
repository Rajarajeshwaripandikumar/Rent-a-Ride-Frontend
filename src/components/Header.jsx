import styles from "../index";
import { navLinks } from "../constants";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner"; // ✅ NEW: to show message

function Header() {
  const { currentUser } = useSelector((state) => state.user);

  const isNormalUser =
    currentUser && !currentUser.isAdmin && !currentUser.isVendor;

  return (
    <header className="w-full flex justify-center px-3 sm:px-6 lg:px-10 pt-3 md:pt-6 bg-[#F5F7FB]">
      <div
        className="
          w-full max-w-[1200px]
          flex flex-col md:flex-row
          items-center md:items-center
          justify-between
          gap-3 md:gap-4
          bg-white
          rounded-2xl
          border border-[#E5E7EB]
          shadow-md
          px-4 sm:px-6 lg:px-8
          py-3 lg:py-4
        "
      >
        {/* LOGO */}
        <Link to="/" className="shrink-0">
          <div className="inline-flex items-center gap-2 select-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-7 h-7 text-[#2563EB]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 13l2-5h14l2 5" />
              <path d="M5 13h14" />
              <circle cx="8" cy="16" r="1.4" />
              <circle cx="16" cy="16" r="1.4" />
            </svg>

            <span className="font-poppins font-semibold text-[18px] lg:text-[20px] tracking-tight">
              <span className="text-[#2563EB]">Rent</span> a Ride
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS – now visible on mobile too */}
        <nav
          className="
            w-full md:w-auto
            flex
            justify-center md:justify-center
            mt-1 md:mt-0
          "
        >
          <ul
            className="
              flex items-center
              gap-3 md:gap-6
              text-[13px] sm:text-[14px]
              overflow-x-auto md:overflow-visible
            "
          >
            {navLinks.map((navlink, index) => (
              <li key={index}>
                <Link
                  to={navlink.path}
                  className="
                    font-poppins font-medium
                    text-[#4B5563]
                    px-2 py-1.5
                    rounded-lg
                    hover:text-[#2563EB]
                    hover:bg-[#EFF5FF]
                    transition-colors duration-150
                  "
                >
                  {navlink.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* BUTTONS & USER AVATAR */}
        <div
          className="
            flex flex-wrap
            items-center
            justify-center md:justify-end
            gap-2 sm:gap-3
            w-full md:w-auto
          "
        >
          {/* Logged-in normal user avatar */}
          {isNormalUser && (
            <Link to="/profile">
              <img
                src={currentUser.profilePicture}
                alt="profile"
                referrerPolicy="no-referrer"
                className="
                  h-9 w-9 rounded-full object-cover
                  border border-[#E5E7EB] shadow-sm
                "
              />
            </Link>
          )}

          {/* Logged-out OR non-normal-user: Show buttons */}
          {!isNormalUser && (
            <>
              {/* Admin */}
              <Link
                to="/adminSignin"
                onClick={(e) => {
                  if (isNormalUser) {
                    e.preventDefault();
                    toast.error("Only admins can sign in here. Use Sign In.");
                  }
                }}
              >
                <button
                  className="
                    flex items-center gap-2
                    px-3 sm:px-4 py-1.5 sm:py-2
                    rounded-full
                    text-[12px] sm:text-[13px] font-medium
                    border border-[#0F7CFF]
                    text-[#0F7CFF]
                    bg-white
                    shadow-sm
                    hover:bg-[#E6F1FF]
                    hover:shadow-md
                    transition-all
                  "
                >
                  <span
                    className="
                      inline-flex items-center justify-center
                      w-3 h-3 rounded-full
                      border border-[#0F7CFF]
                      bg-white
                    "
                  />
                  Admin
                </button>
              </Link>

              {/* Login */}
              <Link
                to="/signin"
                onClick={(e) => {
                  if (currentUser?.isAdmin || currentUser?.isVendor) {
                    e.preventDefault();
                    toast.error("Admin/Vendor must use Admin Sign In.");
                  }
                }}
              >
                <button
                  className="
                    px-3 sm:px-4 py-1.5 sm:py-2
                    rounded-full
                    text-[12px] sm:text-[13px] font-medium
                    border border-[#E5E7EB]
                    text-[#4B5563]
                    bg-white
                    shadow-sm
                    hover:bg-[#F3F4F6]
                    hover:border-[#D1D5DB]
                    hover:shadow-md
                    transition-all
                  "
                >
                  Login
                </button>
              </Link>

              {/* Register */}
              <Link to="/signup">
                <button
                  className="
                    px-4 sm:px-5 py-1.5 sm:py-2
                    rounded-full
                    text-[12px] sm:text-[13px] font-semibold
                    bg-[#0F7CFF]
                    text-white
                    shadow-sm
                    hover:bg-[#0063D1]
                    hover:shadow-md
                    transition-all
                  "
                >
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
