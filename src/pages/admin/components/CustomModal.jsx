// src/pages/admin/components/CustomModal.jsx
import React from "react";

const CustomModal = ({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 backdrop-blur-sm
      "
      onClick={onClose}
    >
      {/* MODAL BOX */}
      <div
        className={`
          relative
          w-full
          max-w-[600px]
          max-h-[90vh]          /* 👈 limit height to viewport */
          overflow-y-auto       /* 👈 allow scrolling inside */
          bg-white
          rounded-2xl
          shadow-xl
          mx-4
          my-6
          ${className}
        `}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute top-3 right-3
            h-7 w-7 flex items-center justify-center
            rounded-full
            bg-gray-100 hover:bg-gray-200
            text-gray-500 hover:text-gray-700
            transition-all
          "
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export default CustomModal;
