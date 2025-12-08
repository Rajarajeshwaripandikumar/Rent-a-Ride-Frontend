// src/pages/AdminHomeMain.jsx
import { useEffect, useState } from "react";
import { LineChart, Button } from "../components";
import { api } from "../../../api"; // ✅ central API helper

const STATS_URL = "/api/admin/stats"; // proxied or api.baseUrl (handled by api)
const STATS_REPORT_URL = "/api/admin/stats/report/csv";
const USERS_URL = "/api/admin/users";
const VENDORS_URL = "/api/admin/vendors";
const VENDORS_REPORT_URL = "/api/admin/vendors/report/csv"; // now unused, but kept

// 🔹 Helper: attach admin JWT from localStorage
const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem("adminToken");
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

/* ---------- CSV HELPERS (for vendor export only) ---------- */

// escape for CSV cell
const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/"/g, '""'); // escape quotes
  return `"${s}"`;
};

// Excel-friendly date for CSV
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

// ensure Excel treats phone as text (no 7.81E+09)
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
        // ✅ use central api helper
        const data = await api.get(STATS_URL, {
          headers: getAuthHeaders(),
        });

        if (!mounted) return;

        // 🔹 Normalize salesOverview into { labels, series } for LineChart
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

        // Normalize into a safe shape for UI
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
      const res = await fetch(`${api.baseUrl}/api/admin/vendors/${editingVendorId}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({
          username: vendorForm.username,
          email: vendorForm.email,
          phoneNumber: vendorForm.phoneNumber,
        }),
      });

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

  // ---------- DOWNLOAD VENDOR CSV (FRONTEND-GENERATED) ----------
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
        const phoneCell = formatPhoneNumber(v.phoneNumber);
        rows.push([
          v.username || "",
          v.email || "",
          phoneCell,
          v.isVendor ? "Yes" : "No",
          formatCsvDate(v.createdAt),
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
      a.download = "vendors_report.csv";
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

  return (
    <div className="mt-6 md:mt-8 px-4 sm:px-6 lg:px-8 select-none">
      {/* SIMPLE PAGE HEADER (no icons) */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          px-4 sm:px-6 lg:px-8
          py-4
          flex flex-wrap items-center justify-between gap-3
        "
      >
        <div>
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold uppercase tracking-wide border border-yellow-300 rounded-md bg-[#FFEFB5] text-slate-800">
            Admin Panel
          </span>
          <p className="text-sm text-slate-500 mt-2">
            Monitor users, vendors, vehicles, and bookings in one unified
            console.
          </p>
        </div>

        <div className="text-xs sm:text-sm text-slate-500">
          <span className="font-medium text-slate-700">Role:</span>{" "}
          Super Admin
        </div>
      </div>

      {/* TOP STATS ROW */}
      <div className="mt-6 flex flex-wrap lg:flex-nowrap justify-center lg:justify-between items-stretch gap-4">
        {/* Earnings card */}
        <div
          className="
            w-full lg:w-80
            rounded-2xl
            bg-white
            border border-gray-200
            shadow-sm
            p-6
            flex flex-col justify-between
          "
        >
          <div>
            <span className="inline-flex	items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
              Earnings
            </span>

            <p className="text-xs text-slate-500 mt-2">
              Total platform earnings
            </p>

            {loading ? (
              <p className="text-2xl font-semibold text-slate-300 mt-3 animate-pulse">
                Loading...
              </p>
            ) : error ? (
              <p className="text-sm text-red-500 mt-3">Error loading</p>
            ) : !hasAnyData ? (
              <p className="text-sm text-slate-500 mt-3">
                No earnings data yet.
              </p>
            ) : (
              <p className="text-3xl font-bold text-slate-900 mt-3">
                {formatCurrency(stats.earnings)}
              </p>
            )}
          </div>

          <div className="mt-5">
            <button
              onClick={handleDownloadStatsReport}
              className="
                px-6 py-3
                rounded-full
                bg-[#0071DC]
                text-white
                text-sm
                font-semibold
                shadow-md
                hover:bg-[#0654BA]
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-[#0071DC]
              "
            >
              Download report
            </button>
          </div>
        </div>

        {/* Small stat cards */}
        <div className="flex flex-wrap justify-center gap-4 flex-1">
          {loading ? (
            <div className="text-slate-400 text-sm self-center">
              Loading cards...
            </div>
          ) : (
            <>
              <div className="md:w-56 w-full rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">
                  Customers
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {stats?.customers ?? 0}
                </p>
              </div>

              <div className="md:w-56 w-full rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">
                  Vehicles
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {stats?.products ?? 0}
                </p>
              </div>

              <div className="md:w-56 w-full rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.14em]">
                  Orders
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {stats?.orders ?? 0}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* USERS & VENDORS MANAGEMENT SECTION */}
      <div
        className="
          mt-8
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-6
        "
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="inline-flex items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
              Management
            </span>
            <p className="text-lg font-semibold text-slate-900 mt-2">
              Users & Vendors
            </p>
            <p className="text-xs text-slate-500 mt-1">
              View user details, update vendor information, and export reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
              <button
                onClick={() => setSelectedTab("users")}
                className={`px-3 py-1 rounded-full transition ${
                  selectedTab === "users"
                    ? "bg-white shadow-sm text-slate-900 font-semibold"
                    : "text-slate-500"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setSelectedTab("vendors")}
                className={`px-3 py-1 rounded-full transition ${
                  selectedTab === "vendors"
                    ? "bg-white shadow-sm text-slate-900 font-semibold"
                    : "text-slate-500"
                }`}
              >
                Vendors
              </button>
            </div>

            {/* Download CSV for vendors */}
            {selectedTab === "vendors" && (
              <button
                onClick={handleDownloadCsv}
                className="px-3 py-2 rounded-full text-[11px] sm:text-xs font-medium bg-[#0071DC] text-white hover:bg-[#0654BA]"
              >
                Download vendor CSV
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                {selectedTab === "vendors" && (
                  <th className="px-4 py-3 text-left">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {uvLoading ? (
                <tr>
                  <td
                    colSpan={selectedTab === "vendors" ? 4 : 3}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    Loading {selectedTab}...
                  </td>
                </tr>
              ) : uvError ? (
                <tr>
                  <td
                    colSpan={selectedTab === "vendors" ? 4 : 3}
                    className="px-4 py-6 text-center text-red-500"
                  >
                    {uvError}
                  </td>
                </tr>
              ) : currentList.length === 0 ? (
                <tr>
                  <td
                    colSpan={selectedTab === "vendors" ? 4 : 3}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No {selectedTab} found.
                  </td>
                </tr>
              ) : (
                currentList.map((item) => {
                  const isEditing =
                    selectedTab === "vendors" &&
                    editingVendorId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      {/* NAME / USERNAME */}
                      <td className="px-4 py-3">
                        {selectedTab === "vendors" && isEditing ? (
                          <input
                            value={vendorForm.username}
                            onChange={(e) =>
                              setVendorForm((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0071DC]"
                          />
                        ) : (
                          item.username || item.name || "-"
                        )}
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-3">
                        {selectedTab === "vendors" && isEditing ? (
                          <input
                            value={vendorForm.email}
                            onChange={(e) =>
                              setVendorForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0071DC]"
                          />
                        ) : (
                          item.email || "-"
                        )}
                      </td>

                      {/* PHONE */}
                      <td className="px-4 py-3">
                        {selectedTab === "vendors" && isEditing ? (
                          <input
                            value={vendorForm.phoneNumber}
                            onChange={(e) =>
                              setVendorForm((prev) => ({
                                ...prev,
                                phoneNumber: e.target.value,
                              }))
                            }
                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0071DC]"
                          />
                        ) : (
                          item.phoneNumber || "-"
                        )}
                      </td>

                      {/* ACTIONS FOR VENDORS */}
                      {selectedTab === "vendors" && (
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={saveVendor}
                                className="px-3 py-1 text-xs rounded-full bg-[#0071DC] text-white hover:bg-[#0654BA]"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditVendor}
                                className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditVendor(item)}
                              className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ROW: Transactions + Chart */}
      <div className="mt-8 flex flex-wrap xl:flex-nowrap gap-6 justify-center">
        {/* Recent Transactions */}
        <div
          className="
            bg-white
            rounded-2xl
            border border-gray-200
            shadow-sm
            p-6
            w-full
            max-w-md
          "
        >
          <div className="flex justify-between items-center gap-2 mb-2">
            <div>
              <span className="inline-flex items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
                Activity
              </span>
              <p className="text-lg font-semibold text-slate-900 mt-2">
                Recent Transactions
              </p>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="text-sm text-slate-400">Loading…</div>
            ) : (stats?.recentTransactions?.length ?? 0) === 0 ? (
              <div className="text-sm text-slate-500">
                No recent transactions yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {stats.recentTransactions.slice(0, 5).map((t, index) => {
                  const bookingLabel =
                    t.bookingCode ||
                    t.bookingId ||
                    `Booking #${String(index + 1).padStart(3, "0")}`;

                  const userLabel =
                    t.userId?.username ||
                    t.userId?.email ||
                    t.customerName ||
                    "Unknown user";

                  return (
                    <li
                      key={t._id || t.id || index}
                      className="flex justify-between items-center text-sm rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">
                          {bookingLabel}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {userLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {formatDateTime(t.createdAt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(t.totalPrice)}
                        </span>
                        {t.status && (
                          <div className="mt-1">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              {t.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Sales Overview line chart */}
        <div
          className="
            bg-white
            rounded-2xl
            border border-gray-200
            shadow-sm
            p-6
            w-full
            xl:flex-1
          "
        >
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
              Analytics
            </span>
            <p className="text-lg font-semibold text-slate-900 mt-2">
              Sales Overview
            </p>
          </div>

          <div className="w-full overflow-auto">
            {stats?.salesOverview?.labels?.length ? (
              <LineChart
                labels={stats.salesOverview.labels}
                series={stats.salesOverview.series}
              />
            ) : (
              <div className="text-sm text-slate-500">
                No sales overview yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeMain;
