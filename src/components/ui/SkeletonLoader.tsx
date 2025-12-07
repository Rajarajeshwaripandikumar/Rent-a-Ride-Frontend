import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="flex flex-row flex-wrap justify-center lg:justify-between items-center gap-8 p-6 w-full mx-auto max-w-[1100px]">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="
            bg-white
            border border-[#E5E7EB]
            shadow-md
            rounded-2xl
            p-6
            w-[330px] md:w-[260px] lg:w-[240px]
            animate-pulse
          "
        >
          {/* Skeleton Image */}
          <div className="w-full h-40 bg-[#F3F4F6] rounded-xl"></div>

          {/* Skeleton Title */}
          <div className="mt-5 h-5 w-3/4 bg-[#E5E7EB] rounded-lg"></div>

          {/* Skeleton Text */}
          <div className="mt-3 h-4 w-5/6 bg-[#E5E7EB] rounded-lg"></div>
          <div className="mt-2 h-4 w-4/6 bg-[#E5E7EB] rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
