// src/pages/AdminHomeMain.jsx
import { useEffect, useState } from "react";
import { LineChart, Button } from "../components";
import { api } from "../../../api"; // ✅ central API wrapper

const STATS_URL = "/api/admin/stats";
const STATS_REPORT_URL = "/api/admin/stats/report/csv";
const USERS_URL = "/api/admin/users";
const VENDORS_URL = "/api/admin/vendors";
// const VENDORS_REPORT_URL = "/api/admin/vendors/report/csv"; // not needed now

// 🔹 Helper: attach admin JWT from localStorage (use accessToken now)
const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem("accessToken");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

// 🔹 Helpers for display
const formatCurrency = (value) =>
  typeof value === "number"
    ? value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      })
    : value;

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ---------- CSV HELPERS (for vendor export) ---------- */

// escape for CSV cell
const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/"/g, '""'); // escape quotes
  return `"${s}"`;
};

// nicer date for CSV
const formatCsvDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

// Helper to ensure Excel treats phone number as text
const formatPhoneNumber = (phone) => (phone ? `="${phone}"` : "");

const AdminHomeMain = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Users & Vendors state
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [uvLoading, setUvLoading] = useState(true);
  const [uvError, setUvError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("users");

  // Vendor edit state
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
  });

  // ---------- FETCH STATS (REAL DB) ----------
  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(STATS_URL, {
          headers: getAuthHeaders(),
        });

        if (!mounted) return;

        let normalizedSalesOverview;

        if (Array.isArray(data.salesOverview)) {
          const labels = data.salesOverview.map(
            (d) => d.month || d.date || d.key
          );
          const series = [
            {
              name: "Revenue",
              data: data.salesOverview.map(
                (d) => d.revenue ?? d.totalSale ?? d.amount ?? 0
              ),
            },
          ];
          normalizedSalesOverview = { labels, series };
        } else if (
          data.salesOverview &&
          Array.isArray(data.salesOverview.labels) &&
          Array.isArray(data.salesOverview.series)
        ) {
          normalizedSalesOverview = data.salesOverview;
        } else {
          normalizedSalesOverview = { labels: [], series: [] };
        }

        setStats({
          earnings: Number(data.earnings) || 0,
          customers: Number(data.customers) || 0,
          products: Number(data.products) || 0,
          orders: Number(data.orders) || 0,
          recentTransactions: Array.isArray(data.recentTransactions)
            ? data.recentTransactions
            : [],
          salesOverview: normalizedSalesOverview,
        });
      } catch (err) {
        console.error("admin stats fetch failed:", err);
        if (mounted)
          setError(err.message || "Failed to fetch stats from server");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- FETCH USERS & VENDORS ----------
  useEffect(() => {
    let mounted = true;

    const fetchUsersAndVendors = async () => {
      try {
        setUvLoading(true);
        setUvError(null);

        const [usersData, vendorsData] = await Promise.all([
          api.get(USERS_URL, { headers: getAuthHeaders() }),
          api.get(VENDORS_URL, { headers: getAuthHeaders() }),
        ]);

        if (!mounted) return;

        setUsers(usersData.users || []);
        setVendors(vendorsData.vendors || []);
      } catch (err) {
        console.error("users/vendors fetch failed:", err);
        if (mounted)
          setUvError(err.message || "Failed to fetch users/vendors");
      } finally {
        if (mounted) setUvLoading(false);
      }
    };

    fetchUsersAndVendors();
    return () => {
      mounted = false;
    };
  }, []);

  const hasAnyData =
    stats &&
    ((stats.earnings && stats.earnings > 0) ||
      (stats.customers && stats.customers > 0) ||
      (stats.products && stats.products > 0) ||
      (stats.orders && stats.orders > 0));

  // ---------- VENDOR EDIT HELPERS ----------
  const startEditVendor = (vendor) => {
    setEditingVendorId(vendor._id);
    setVendorForm({
      username: vendor.username || "",
      email: vendor.email || "",
      phoneNumber: vendor.phoneNumber || "",
    });
  };

  const cancelEditVendor = () => {
    setEditingVendorId(null);
    setVendorForm({
      username: "",
      email: "",
      phoneNumber: "",
    });
  };

  const saveVendor = async () => {
    if (!editingVendorId) return;
    try {
      const res = await fetch(
        `${api.baseUrl}/api/admin/vendors/${editingVendorId}`,
        {
          method: "PUT",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          credentials: "include",
          body: JSON.stringify({
            username: vendorForm.username,
            email: vendorForm.email,
            phoneNumber: vendorForm.phoneNumber,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update vendor");
      }

      const data = await res.json();
      const updatedVendor = data.vendor;

      setVendors((prev) =>
        prev.map((v) => (v._id === updatedVendor._id ? updatedVendor : v))
      );

      cancelEditVendor();
    } catch (err) {
      console.error("Update vendor error:", err);
      alert(err.message || "Failed to update vendor");
    }
  };

  // ---------- DOWNLOAD VENDOR CSV (FRONTEND GENERATED) ----------
  const handleDownloadCsv = () => {
    try {
      if (!vendors || vendors.length === 0) {
        alert("No vendors to export");
        return;
      }

      const rows = [];

      // header
      rows.push(["Username", "Email", "Phone", "IsVendor", "CreatedAt"]);

      vendors.forEach((v) => {
        // IMPORTANT: wrap phone with ="..." so Excel keeps it as text
        const phoneCell = formatPhoneNumber(v.phoneNumber);
        rows.push([
          v.username || "",
          v.email || "",
          phoneCell, // Excel-friendly phone formatting
          v.isVendor ? "Yes" : "No",
          formatCsvDate(v.createdAt), // Date formatting
        ]);
      });

      const csvString = rows
        .map((row) => row.map(csvEscape).join(","))
        .join("\r\n");

      const blob = new Blob(["\uFEFF" + csvString], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vendors_report.csv"; // name of the file
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Vendor CSV export error:", err);
      alert(err.message || "Could not export vendor CSV");
    }
  };

  // ✅ ---------- DOWNLOAD ADMIN STATS CSV (EARNINGS CARD) ----------
  const handleDownloadStatsReport = async () => {
    try {
      const res = await fetch(`${api.baseUrl}${STATS_REPORT_URL}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to download stats report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "admin_stats_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Stats CSV download error:", err);
      alert(err.message || "Could not download stats report");
    }
  };

  const currentList = selectedTab === "users" ? users : vendors;

  /* ---------- JSX BELOW IS UNCHANGED ---------- */
  return (
    <div className="mt-6 md:mt-8 px-4 sm:px-6 lg:px-8 select-none">
      {/* Your existing JSX code remains unchanged */}
      {/* Only the handleDownloadCsv and helper functions are updated */}
    </div>
  );
};

export default AdminHomeMain;
