const Footer = () => {
  return (
    <footer
      className="
        w-full
        border-t border-gray-200
        bg-slate-50
        mt-10
        py-4
        rounded-t-2xl
        shadow-sm
      "
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-slate-600 tracking-wide font-medium">
          © {new Date().getFullYear()} Rent-a-Ride Admin Console
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Built with ❤️ for seamless fleet & vendor management
        </p>
      </div>
    </footer>
  );
};

export default Footer;
