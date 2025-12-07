// src/pages/admin/pages/ColorPicker.jsx
import { useState } from "react";
import { HexColorPicker } from "react-colorful"; // ✅ no CSS import here

const presetColors = [
  "#1D4ED8", // blue
  "#0EA5E9", // sky
  "#22C55E", // green
  "#F97316", // orange
  "#E11D48", // rose
  "#7C3AED", // violet
];

const ColorPicker = () => {
  const [color, setColor] = useState("#1D4ED8");

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 select-none">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <span
          className="
            inline-flex items-center px-2 py-[2px]
            text-[11px] font-semibold uppercase tracking-[0.16em]
            text-[#1D4ED8] bg-[#EFF6FF]
            border border-[#BFDBFE]
            rounded-md
          "
        >
          Color Picker
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
          Theme Color Selection
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Choose and customize your preferred dashboard accent colors.
        </p>
      </div>

      {/* CONTENT CARD */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-5 sm:p-6 lg:p-8
          flex flex-col md:flex-row gap-8
        "
      >
        {/* Left: Picker */}
        <div className="flex flex-col items-center gap-4">
          <div className="border border-gray-200 rounded-xl p-3">
            {/* Force a nice size with Tailwind, since we don't import their CSS */}
            <div className="w-56 h-48">
              <HexColorPicker color={color} onChange={setColor} />
            </div>
          </div>

          {/* Presets */}
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Quick presets
            </p>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`
                    w-7 h-7 rounded-full border
                    ${c === color ? "ring-2 ring-offset-2 ring-[#1D4ED8]" : ""}
                  `}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview & info */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Preview card */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Preview
            </p>

            <div className="space-y-3">
              {/* Example button */}
              <button
                type="button"
                className="
                  inline-flex items-center px-4 py-2.5 rounded-full
                  text-sm font-medium text-white shadow-sm
                "
                style={{ backgroundColor: color }}
              >
                Primary action
              </button>

              {/* Example tag */}
              <span
                className="
                  inline-flex items-center px-2 py-[3px] rounded-full
                  text-[11px] font-medium
                "
                style={{
                  backgroundColor: `${color}1A`, // ~10% opacity
                  color,
                }}
              >
                Accent label
              </span>

              {/* Example progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Usage example</span>
                  <span>60%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "60%", backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hex display */}
          <div className="border border-dashed border-gray-300 rounded-xl p-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Selected color
            </p>
            <p className="font-mono text-sm text-slate-800">{color}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              You can store this value in your theme config or database to
              persist the dashboard color.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
