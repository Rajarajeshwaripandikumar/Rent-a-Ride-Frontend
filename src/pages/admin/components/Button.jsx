function Button({
  bgColor = "#0071DC",     // Walmart blue default
  color = "white",
  size = "sm",
  text = "Button",
  borderRadius = "999px",  // pill shape to match your UI
}) {
  // Tailwind size mapping
  const sizeClasses = {
    xs: "text-xs px-3 py-1.5",
    sm: "text-sm px-4 py-2",
    md: "text-base px-5 py-2.5",
    lg: "text-lg px-6 py-3",
  };

  return (
    <button
      type="button"
      style={{
        backgroundColor: bgColor,
        color,
        borderRadius,
      }}
      className={`
        ${sizeClasses[size] || sizeClasses.sm}
        font-semibold
        border border-[#E5E7EB]
        shadow-sm
        hover:bg-[#0654BA]           // deeper walmart blue hover
        hover:border-[#93C5FD]
        active:scale-[0.97]
        transition-all duration-200
      `}
    >
      {text}
    </button>
  );
}

export default Button;
