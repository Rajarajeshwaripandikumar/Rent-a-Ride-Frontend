const Favorites = () => {
  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10 bg-[#F5F7FB]">
      <div
        className="
          w-full max-w-3xl
          bg-white
          rounded-2xl
          shadow-md
          border border-[#E5E7EB]
          px-6 py-8
          flex flex-col items-center
        "
      >
        <h1 className="text-2xl font-semibold text-[#0F172A]">
          Your Favorites
        </h1>

        <p className="mt-2 text-sm text-center text-[#6B7280] max-w-sm">
          Your saved vehicles will appear here.
          Add cars to your favorites to quickly access them later.
        </p>

        {/* BEAUTIFUL MODERN HEART ILLUSTRATION */}
        <div className="mt-10 w-32 opacity-95">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
            className="w-full h-full drop-shadow-sm"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12.1 20.3c-.3.2-.7.2-1 0C7.4 17.4 4 14.4 2.4 11.4 1.1 9 1.9 5.9 4.1 4.6 6.3 3.3 8.8 4 10.2 6c.3.5 1 .5 1.3 0 1.4-2 3.9-2.7 6.1-1.4 2.2 1.3 3 4.4 1.7 6.8-1.6 3-5 6-8.2 8.9Z"
            />
          </svg>
        </div>

        <p className="text-sm text-[#6B7280] mt-4">
          No favorites added yet.
        </p>
      </div>
    </div>
  );
};

export default Favorites;
