"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { useMediaQuery } from "react-responsive";

/**
 * Redesigned HeroParallax (District / Walmart-inspired)
 * - Soft cards, rounded 2xl corners, subtle shadows
 * - Yellow price badge (#FFC220) + blue primary button (#2563EB)
 * - Right-to-left visual layout preserved (flex-row-reverse)
 * - Uses same API: HeroParallax returns UI and ProductCard accepts translate MotionValue
 */

export const products = [
  {
    title: "Premium SUV — Weekend Special",
    link: "#",
    thumbnail:
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    price: "₹3,299/day",
  },
  {
    title: "Luxury Sedan — Comfortable & Clean",
    link: "#",
    thumbnail:
      "https://img.freepik.com/premium-photo/luxury-car-rental-car-sale-social-media-instagram-post-template-design_1126722-2530.jpg",
    price: "₹4,999/day",
  },
  {
    title: "Compact — Easy City Driving",
    link: "#",
    thumbnail:
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    price: "₹1,999/day",
  },
  {
    title: "Convertible — Weekend Getaway",
    link: "#",
    thumbnail:
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    price: "₹5,499/day",
  },
];

export const HeroParallax = () => {
  const firstRow = products.slice(0, 1);
  const secondRow = products.slice(1, 2);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 240, damping: 28 };

  // responsive transforms
  const isMobile = useMediaQuery({ maxWidth: 500 });
  const isTablet = useMediaQuery({ minWidth: 501, maxWidth: 900 });

  const translateXMobile = useTransform(scrollYProgress, [0, 0.3], [600, 40]);
  const translateXTablet = useTransform(scrollYProgress, [0, 0.4], [900, 200]);
  const translateXDesktop = useTransform(scrollYProgress, [0, 0.4], [1200, 90]);

  const translateX = useSpring(
    isMobile ? translateXMobile : isTablet ? translateXTablet : translateXDesktop,
    springConfig
  );

  // a mild 'out' transform for second row (if used later)
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0.7, 1], [200, -900]),
    springConfig
  );

  // stylistic springs
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.35], [8, 0]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0, 1]), springConfig);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.25], [-120, 60]), springConfig);

  return (
    <div
      ref={ref}
      className="h-full py-20 lg:py-28 overflow-hidden mb-24 bg-[#F5F7FB] antialiased relative flex flex-col"
    >
      <Header />

      <motion.div
        style={{
          rotateZ,
          opacity,
          translateY,
        }}
        className="px-4 sm:px-6 lg:px-10"
      >
        {/* card container (right-to-left visual) */}
        <motion.div className="flex flex-row-reverse items-center justify-center gap-8 lg:gap-12 mb-12">
          {firstRow.map((product, index) => (
            <div
              key={index}
              className="
                flex flex-col lg:flex-row items-center
                max-w-full md:max-w-4xl lg:max-w-6xl
                gap-6 lg:gap-8
                rounded-2xl
                bg-white
                border border-[#E8EDF5]
                shadow-[0_10px_30px_rgba(2,6,23,0.06)]
                py-8 px-6 md:py-12 md:px-10
                mx-auto
                w-full
              "
            >
              {/* text block */}
              <div className="flex-1 min-w-[220px]">
                <p className="text-xs md:text-sm font-semibold tracking-wider text-[#2563EB] uppercase">
                  Featured
                </p>

                <h3 className="mt-3 text-xl md:text-2xl lg:text-3xl font-extrabold text-[#0F172A] leading-tight">
                  {product.title}
                </h3>

                <p className="mt-4 text-sm md:text-base text-[#4B5563] max-w-xl">
                  Clean, reliable rides with unlimited kilometers on selected plans.
                  Free cancellations up to 24 hours before pickup. Flexible pickup locations.
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFF4D3] text-sm font-semibold text-[#92400E] border border-[#FFE7A7]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mr-2">
                      <path d="M12 2v6" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20.5 7.5A8.5 8.5 0 1 1 3.5 10" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Best Price
                  </span>

                  <a
                    href={product.link}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-[#1D4ED8] transition"
                  >
                    Book Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M12 5l7 7-7 7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* product visual card */}
              <div className="w-[50vh] md:w-[48vh] lg:w-[42vh] flex-shrink-0">
                <ProductCard product={product} translate={translateX} />
              </div>
            </div>
          ))}
        </motion.div>

        {/* optional second row placeholder (kept for future use) */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.slice(1, 4).map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-[#E8EDF5] rounded-2xl shadow-sm p-4 flex items-center gap-4"
                >
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#F8FAFC]">
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0F172A]">{p.title || "Model"}</div>
                    <div className="text-xs text-[#6B7280] mt-1">{p.price}</div>
                  </div>
                  <div className="ml-auto">
                    <a href={p.link} className="text-sm font-semibold text-[#2563EB]">View</a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="flex justify-center px-4 sm:px-6 lg:px-10">
      <div className="flex justify-between items-center max-w-7xl mx-auto py-8 md:py-12 w-full">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight">
            The Ultimate <span className="text-[#2563EB]">Car Rental</span> For You
          </h1>
          <p className="max-w-2xl text-sm md:text-base mt-4 text-[#4B5563]">
            Beautiful, reliable cars — flexible plans for every occasion. Book with confidence and drive away today.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a className="text-sm px-4 py-2 rounded-full border border-[#E5E7EB] text-[#2563EB] font-semibold" href="#fleet">
            View Fleet
          </a>
          <a className="text-sm px-4 py-2 rounded-full bg-[#2563EB] text-white font-semibold" href="#offers">
            Offers
          </a>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
    price?: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        scale: 1.03,
        y: -6,
        transition: { type: "spring", stiffness: 260, damping: 24 },
      }}
      className="
        relative
        group
        h-[220px] md:h-[280px] lg:h-[320px]
        w-full
        rounded-2xl
        overflow-hidden
        shadow-[0_8px_24px_rgba(2,6,23,0.08)]
        border border-[#F1F5F9]
        bg-white
      "
    >
      <div className="absolute inset-0">
        {/* image */}
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-opacity duration-300" />

        {/* price badge */}
        {product.price && (
          <div className="absolute top-4 right-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF4D3] border border-[#FFE7A7] text-sm font-semibold text-[#92400E] shadow-sm">
              <span className="text-xs"> {product.price} </span>
            </div>
          </div>
        )}

        {/* CTA at bottom */}
        <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-white drop-shadow">{product.title}</div>
            <div className="text-xs text-white/90 mt-1">Free cancel • Flexible pickup</div>
          </div>

          <a
            href={product.link}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#2563EB] text-white text-sm font-semibold shadow hover:bg-[#1D4ED8] transition"
          >
            Book
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M12 5l7 7-7 7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
};
