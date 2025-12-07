import React from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarHeader() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="flex flex-col items-start px-2 py-2 focus:outline-none"
      aria-label="Go to home"
    >
      <span className="text-xl font-bold text-[#0F172A] tracking-tight">
        Rent a Ride
      </span>

      
    </button>
  );
}
