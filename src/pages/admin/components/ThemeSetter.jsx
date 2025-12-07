const ThemeSetter = () => {
  return (
    <div
      className="
        w-full
        max-w-md
        bg-white
        rounded-2xl
        border border-gray-200
        shadow-sm
        p-6
      "
    >
      {/* Header */}
      <div className="mb-3">
        <span className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-md">
          Appearance
        </span>
      </div>

      <h2 className="text-lg font-semibold text-slate-800">
        Theme Settings
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        Customize your admin dashboard appearance to suit your preferences.
      </p>

      {/* Placeholder body */}
      <div className="mt-6 text-slate-600 text-sm bg-slate-50 border border-slate-200 rounded-xl p-4">
        Theme settings UI will appear here.
      </div>
    </div>
  );
};

export default ThemeSetter;
