// src/pages/Home.jsx
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import styles from "../../index";
// NOTE: we intentionally DON'T import a local image here because we'll use the public folder path:
// src="/vehicles/lamborghini-sian.jpg"
import CarSearch from "./CarSearch";
import { HeroParallax } from "../../components/ui/Paralax";
import { setIsSweetAlert } from "../../redux/user/userSlice";
import Footers from "../../components/Footer";

function Home() {
  const ref = useRef(null);
  const { isSweetAlert } = useSelector((state) => state.user || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSweetAlert) return;

    Swal.fire({
      show: true,
      title: "",
      text: "Vehicle Booked Successfully",
      icon: "success",
      showDenyButton: true,
      confirmButtonText: "Go to Home",
      confirmButtonColor: "#22c55e",
      denyButtonColor: "black",
      denyButtonText: `See Orders`,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      } else if (result.isDenied) {
        navigate("/profile/orders");
      }
      dispatch(setIsSweetAlert(false));
    });
  }, [isSweetAlert, dispatch, navigate]);

  return (
    <>
      {/* Page wrapper */}
      <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
        {/* Main */}
        <main className="flex-grow w-full">
          {/* Hero section */}
          <section className="relative w-full flex justify-center px-4 sm:px-6 lg:px-10 pt-28 pb-10">
            <div className="w-full sm:max-w-[900px] lg:max-w-[1200px] relative">
              {/* dotted background */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

              {/* Card */}
              <div
                className="
                  relative z-10
                  bg-white
                  rounded-3xl
                  border border-[#E5E7EB]
                  shadow-lg
                  px-6 sm:px-10 lg:px-14
                  py-10 lg:py-12
                  flex flex-col sm:flex-row
                  items-center justify-between
                  gap-10
                "
              >
                {/* LEFT - Text */}
                <div className="max-w-lg">
                  <p
                    className={`
                      py-2 text-[10px] md:text-[12px]
                      ${styles.paragraph}
                      text-[#2563EB]
                      font-medium
                      tracking-[0.18em]
                      uppercase
                    `}
                  >
                    Plan your trip now
                  </p>
                  <h1
                    className={`
                      font-extrabold
                      text-[30px] leading-9
                      md:text-[40px] md:leading-[2.7rem]
                      lg:text-[52px] lg:leading-[3.3rem]
                      mb-5
                      ${styles.heading2}
                      text-[#0F172A]
                    `}
                  >
                    Save <span className="text-[#2563EB]">big</span> with our
                    <br />
                    car rental
                  </h1>
                  <p
                    className={`
                      ${styles.paragraph}
                      text-[#4B5563]
                      text-sm md:text-[15px]
                      leading-relaxed
                      text-justify
                    `}
                  >
                    Rent the car of your dreams. Unbeatable prices, unlimited
                    miles, flexible pick-up options and much more.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        ref.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      className="
                        inline-flex items-center justify-center
                        bg-[#2563EB]
                        text-white
                        text-[12px] md:text-[14px]
                        px-4 md:px-6
                        py-2.5 md:py-3
                        rounded-full
                        font-semibold
                        shadow-md
                        hover:bg-[#1D4ED8]
                        transition-colors
                      "
                    >
                      Book Ride{" "}
                      <span className="ml-2 text-sm">
                        <i className="bi bi-check-circle-fill" />
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        ref.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      className="
                        inline-flex items-center justify-center
                        bg-white
                        text-[#2563EB]
                        text-[12px] md:text-[14px]
                        px-4 md:px-6
                        py-2.5 md:py-3
                        rounded-full
                        font-semibold
                        border border-[#2563EB]
                        hover:bg-[#EFF5FF]
                        transition-colors
                      "
                    >
                      Learn More{" "}
                      <span className="ml-1 text-sm">
                        <i className="bi bi-chevron-right" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* RIGHT - Mirrored Car Image */}
                <div className="hidden sm:flex justify-end lg:mr-4">
                  <div className="relative">
                    {/* Blue gradient removed - no background glow */}
                    <img
                      src="/vehicles/home.webp"
                      alt="home"
                      className="relative max-w-[380px] lg:max-w-[420px] object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Car search */}
          <section ref={ref} className="w-full px-4 sm:px-6 lg:px-10 mt-4">
            <CarSearch />
          </section>

          {/* Parallax section */}
          <section className="relative mt-10">
            <HeroParallax />
          </section>
        </main>

        <Footers />
      </div>
    </>
  );
}

export default Home;
