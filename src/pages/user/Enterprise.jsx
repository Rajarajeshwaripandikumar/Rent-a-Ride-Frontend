import { Link } from "react-router-dom";
import Footers from "../../components/Footer";
import styles from "../..";

function Enterprise() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
        <main className="flex-grow w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-16">
          <div className="text-center mt-6 mb-12">
            <h1
              className={`
                ${styles.heading2}
                text-3xl sm:text-4xl
                font-bold
                text-[#0F172A]
              `}
            >
              List your vehicle with us
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#6B7280]">
              To list your vehicle, login as a vendor first{" "}
              <Link
                to="/vendorSignin"
                state={{ from: "/enterprise" }}
                className="text-[#2563EB] underline underline-offset-4 hover:text-[#1D4ED8]"
              >
                login as vendor
              </Link>
            </p>
          </div>

          {/* Info Card */}
          <div className="w-full max-w-3xl mx-auto">
            <div
              className="
                rounded-2xl
                border border-[#E5E7EB]
                bg-white
                shadow-md
                px-5 sm:px-8
                py-6 sm:py-8
              "
            >
              <p className="text-sm sm:text-base text-[#374151]">
                We welcome individual owners and fleet partners. After signing in
                as a vendor you can:
              </p>
              <ul className="mt-4 text-sm sm:text-base text-[#4B5563] space-y-2">
                <li>• Register and verify vehicles</li>
                <li>• Manage availability and pricing</li>
                <li>• Receive bookings and track revenue</li>
              </ul>

              <div className="mt-6">
                <Link
                  to="/vendorSignin"
                  state={{ from: "/enterprise" }}
                  className="
                    inline-flex items-center justify-center
                    rounded-full
                    bg-[#2563EB]
                    px-5 py-2.5
                    text-sm font-semibold
                    text-white
                    hover:bg-[#1D4ED8]
                    transition-colors
                  "
                >
                  Login as Vendor
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footers />
      </div>
    </>
  );
}

export default Enterprise;
