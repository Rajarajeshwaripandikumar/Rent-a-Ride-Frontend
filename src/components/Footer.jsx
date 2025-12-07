import {
  FooterCopyright,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import { BsGithub, BsLinkedin } from "react-icons/bs";

const Footers = () => {
  return (
    <footer className="w-full flex justify-center px-4 sm:px-6 lg:px-10 mt-16 lg:mt-24 mb-10 bg-[#F5F7FB]">
      <div
        className="
          w-full max-w-[1200px]
          bg-white
          rounded-2xl
          border border-[#E5E7EB]
          shadow-md
          px-5 sm:px-8 lg:px-10
          py-6 lg:py-8
        "
      >
        {/* Top section */}
        <div
          className="
            flex flex-col md:flex-row
            justify-between gap-8
            border-b border-[#E5E7EB]
            pb-6 lg:pb-8
          "
        >
          {/* Brand + short text */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 mb-3 select-none">
              {/* Same logo icon as Header */}
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

              <h1 className="font-poppins font-semibold text-[18px] lg:text-[22px] text-[#0F172A] tracking-tight">
                <span className="text-[#2563EB]">Rent</span> a Ride
              </h1>
            </div>

            <p className="text-[13px] sm:text-[14px] text-[#6B7280] leading-relaxed">
              Seamless car rentals with a modern, intuitive experience. Book,
              manage, and ride with confidence — built with love by Tejasvi.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <FooterTitle
                title="About"
                className="uppercase tracking-[0.15em] text-[11px] text-[#9CA3AF]"
              />
              <FooterLinkGroup col>
                <FooterLink
                  href="#"
                  className="
                    text-[14px] text-[#4B5563]
                    hover:text-[#2563EB]
                    hover:underline
                    underline-offset-4
                    transition-colors
                  "
                >
                  Rent a Ride
                </FooterLink>
                <FooterLink
                  href="#"
                  className="
                    text-[14px] text-[#4B5563]
                    hover:text-[#2563EB]
                    hover:underline
                    underline-offset-4
                    transition-colors
                  "
                >
                  Car Rental
                </FooterLink>
              </FooterLinkGroup>
            </div>

            <div>
              <FooterTitle
                title="Support"
                className="uppercase tracking-[0.15em] text-[11px] text-[#9CA3AF]"
              />
              <FooterLinkGroup col>
                <FooterLink
                  href="#"
                  className="
                    text-[14px] text-[#4B5563]
                    hover:text-[#2563EB]
                    hover:underline
                    underline-offset-4
                    transition-colors
                  "
                >
                  Help Center
                </FooterLink>
                <FooterLink
                  href="#"
                  className="
                    text-[14px] text-[#4B5563]
                    hover:text-[#2563EB]
                    hover:underline
                    underline-offset-4
                    transition-colors
                  "
                >
                  FAQs
                </FooterLink>
              </FooterLinkGroup>
            </div>

            <div>
              <FooterTitle
                title="Legal"
                className="uppercase tracking-[0.15em] text-[11px] text-[#9CA3AF]"
              />
              <FooterLinkGroup col>
                <FooterLink
                  href="#"
                  className="
                    text-[14px] text-[#4B5563]
                    hover:text-[#2563EB]
                    hover:underline
                    underline-offset-4
                    transition-colors
                  "
                >
                  Privacy Policy
                </FooterLink>
                <FooterLink
                  href="#"
                  className="
                    text-[14px] text-[#4B5563]
                    hover:text-[#2563EB]
                    hover:underline
                    underline-offset-4
                    transition-colors
                  "
                >
                  Terms &amp; Conditions
                </FooterLink>
              </FooterLinkGroup>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 lg:pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <FooterCopyright
            href="#"
            by="Rent a Ride"
            year={2025}
            className="text-[12px] sm:text-[13px] text-[#9CA3AF]"
          />

          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#9CA3AF] hidden sm:inline">
              Connect
            </span>
            <div className="flex space-x-3 sm:space-x-4">
              <FooterIcon
                href="https://www.linkedin.com/in"
                icon={BsLinkedin}
                className="
                  h-9 w-9
                  rounded-full
                  border border-[#E5E7EB]
                  bg-white
                  flex items-center justify-center
                  shadow-sm
                  hover:bg-[#EFF5FF]
                  hover:text-[#2563EB]
                  transition-colors duration-150
                "
              />
              <FooterIcon
                href="https://github.com/Rajarajeshwaripandikumar"
                icon={BsGithub}
                className="
                  h-9 w-9
                  rounded-full
                  border border-[#E5E7EB]
                  bg-white
                  flex items-center justify-center
                  shadow-sm
                  hover:bg-[#EFF5FF]
                  hover:text-[#2563EB]
                  transition-colors duration-150
                "
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footers;
