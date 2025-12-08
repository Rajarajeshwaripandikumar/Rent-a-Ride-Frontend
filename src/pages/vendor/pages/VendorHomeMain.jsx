import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { api } from "../../../api"; // 👈 FIXED: correct path + named import

function VendorHomeMain() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken"); // Get token from localStorage

        if (!token) {
          setError("No token found, please log in.");
          return;
        }

        console.log("Access Token:", token);  // Log token for debugging

        // ✅ Uses api.js → correct base URL + Authorization header + credentials
        const json = await api.get("/api/vendor/stats", {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to headers
          },
        });

        if (!cancelled) {
          // controller returns { success, data: { ... } }
          setStats(json.data || {});
        }
      } catch (err) {
        if (!cancelled) {
          if (err.status === 403) {
            setError("You do not have permission to view these stats.");
          } else {
            setError(err.message || "Failed to load stats");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // 📁 CSV download handler – FRONTEND ONLY (no admin route)
  const handleDownloadReport = () => {
    if (!stats) return;

    setDownloading(true);

    const {
      totalVehicles = 0,
      totalBookings = 0,
      completedTrips = 0,
      earnings = 0,
    } = stats;

    // Build a simple CSV from the current stats
    const csvContent =
      "Metric,Value\n" +
      `Total Vehicles,${totalVehicles}\n` +
      `Total Bookings,${totalBookings}\n` +
      `Completed Trips,${completedTrips}\n` +
      `Earnings,${earnings}\n`;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `vendor-report-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-500">
        Loading vendor stats…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Failed to load vendor stats: {error}
      </div>
    );
  }

  const {
    totalVehicles = 0,
    totalBookings = 0,
    completedTrips = 0,
    earnings = 0,
  } = stats || {};

  return (
    <div className="space-y-4">
      {/* Header row: title + CSV button */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base md:text-lg font-semibold text-slate-900">
          Vendor overview
        </h2>

        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={downloading}
          className={`
            inline-flex items-center gap-2
            px-3 md:px-4 py-2
            rounded-lg
            text-xs md:text-sm
            font-medium
            transition
            ${
              downloading
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-[#0071DC] hover:bg-[#0654BA] text-white shadow-sm"
            }
          `}
        >
          <FiDownload className="text-sm md:text-base" />
          {downloading ? "Downloading…" : "Report (CSV)"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Vehicles
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {totalVehicles}
          </p>
        </div>

        {/* Total Bookings */}
        <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Bookings
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {totalBookings}
          </p>
        </div>

        {/* Completed Trips */}
        <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Completed Trips
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {completedTrips}
          </p>
        </div>

        {/* Total Earnings */}
        <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Earnings
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            ₹{Number(earnings || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VendorHomeMain;
