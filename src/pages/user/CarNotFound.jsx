import { useNavigate } from "react-router-dom";

const CarNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center items-center bg-[#F5F7FB] px-4 py-12">
      <div
        className="
          w-full max-w-lg
          bg-white
          rounded-2xl
          border border-[#E5E7EB]
          shadow-md
          px-6 py-8 sm:px-8
          text-center
        "
      >
        {/* Illustration */}
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 120"
            className="mx-auto h-40 w-auto sm:h-48 text-[#2563EB]"
          >
            {/* Ground line */}
            <line
              x1="10"
              y1="100"
              x2="190"
              y2="100"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Car body */}
            <rect
              x="40"
              y="55"
              width="120"
              height="30"
              rx="8"
              fill="#EFF6FF"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Car roof */}
            <path
              d="M60 55 L90 35 H130 L150 55 Z"
              fill="#DBEAFE"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Wheels */}
            <circle cx="65" cy="95" r="9" fill="white" stroke="currentColor" strokeWidth="2" />
            <circle cx="135" cy="95" r="9" fill="white" stroke="currentColor" strokeWidth="2" />

            {/* Wheel centers */}
            <circle cx="65" cy="95" r="3" fill="currentColor" />
            <circle cx="135" cy="95" r="3" fill="currentColor" />

            {/* Front light */}
            <circle cx="155" cy="70" r="3" fill="#FBBF24" />

            {/* “No cars” bubble */}
            <path
              d="M40 35
               C30 35, 25 28, 28 22
               C22 18, 24 10, 32 10
               C35 5, 42 5, 46 9
               C52 7, 58 10, 58 16
               C64 18, 66 25, 62 30
               C60 33, 55 35, 50 35
               Z"
              fill="#FEE2E2"
              stroke="#F97373"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-xl sm:text-2xl font-semibold text-[#0F172A]">
          No cars available right now
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-sm sm:text-base text-[#6B7280]">
          We couldn&apos;t find any vehicles that match your search.  
          Try changing the location, dates, or filters and search again.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="
              inline-flex items-center justify-center
              rounded-full
              border border-[#D1D5DB]
              px-4 py-2
              text-sm font-medium
              text-[#374151]
              bg-white
              hover:bg-[#F3F4F6]
              transition-colors
            "
          >
            Refresh results
          </button>

          <button
            onClick={() => navigate("/")}
            className="
              inline-flex items-center justify-center
              rounded-full
              bg-[#2563EB]
              px-4 py-2
              text-sm font-semibold
              text-white
              shadow-sm
              hover:bg-[#1D4ED8]
              transition-colors
            "
          >
            Go back home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarNotFound;
