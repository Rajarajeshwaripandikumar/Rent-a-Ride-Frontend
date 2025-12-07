import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

const EMPLOYEES_URL = "/api/admin/allEmployees"; // 👈 change if your route is different

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- Fetch employees ----------------
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(EMPLOYEES_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("[Employees] fetch failed:", res.status, txt);
        setErrorMsg("Failed to load employees.");
        setEmployees([]);
        setLoading(false);
        return;
      }

      const raw = await res.json().catch(() => null);
      console.log("[Employees] raw response:", raw);

      let list = [];

      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) list = raw.data;
        else if (Array.isArray(raw.employees)) list = raw.employees;
        else if (Array.isArray(raw.allEmployees)) list = raw.allEmployees;
        else {
          const firstArrayProp = Object.values(raw).find((v) =>
            Array.isArray(v)
          );
          list = firstArrayProp || [];
        }
      }

      console.log("[Employees] parsed list:", list);
      setEmployees(list);
      setErrorMsg(null);
      setLoading(false);
    } catch (err) {
      console.error("[Employees] fetch error:", err);
      setErrorMsg("Error loading employees.");
      setEmployees([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ---------------- Helpers ----------------
  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const normalizeRole = (role) => {
    if (!role) return "—";
    return String(role).replace(/_/g, " ");
  };

  const normalizeStatus = (active, status) => {
    if (status) return status;
    if (active === true) return "active";
    if (active === false) return "inactive";
    return "—";
  };

  // ---------------- DataGrid columns ----------------
  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 180,
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
      flex: 1.2,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "role",
      headerName: "Role",
      width: 140,
      renderCell: (params) => (
        <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200">
          {normalizeRole(params.value)}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const value = String(params.value || "").toLowerCase();
        const isActive = value === "active" || value === "enabled";
        const cls = isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
          : "bg-rose-50 text-rose-700 border-rose-100";

        return (
          <span
            className={`inline-flex items-center justify-center px-3 py-1 text-[11px] font-medium rounded-full border ${cls}`}
          >
            {params.value || "—"}
          </span>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 140,
      renderCell: (params) => formatDate(params.value),
    },
  ];

  // ---------------- Build rows safely ----------------
  const rows = Array.isArray(employees)
    ? employees.map((emp) => ({
        id:
          emp._id ||
          emp.id ||
          emp.employeeId ||
          emp.userId ||
          Math.random().toString(36).slice(2),
        name: emp.name || emp.fullName || emp.username || "Unknown",
        email: emp.email || emp.mail || "—",
        phone: emp.phone || emp.mobile || emp.contact || "—",
        role: emp.role || emp.userRole || emp.position || "EMPLOYEE",
        status: normalizeStatus(emp.active, emp.status),
        createdAt: emp.createdAt || emp.joinedAt || emp.created_on,
      }))
    : [];

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Employees
            </p>
            <p className="text-sm md:text-base font-semibold text-slate-800">
              Internal staff managing Rent a Ride
            </p>
            {errorMsg && (
              <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
            )}
          </div>

          {/* You can add "Add Employee" button later here */}
        </div>

        {/* Table */}
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 8,
                },
              },
            }}
            pageSizeOptions={[5, 8, 10]}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              fontSize: "0.875rem",
              ".MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "&.MuiDataGrid-root": {
                borderRadius: "0.75rem",
                backgroundColor: "#FFFFFF",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#F9FAFB",
                borderBottom: "1px solid #E5E7EB",
                fontWeight: 600,
                fontSize: "0.78rem",
                color: "#4B5563",
              },
              "& .MuiDataGrid-row": {
                borderBottom: "1px solid #F3F4F6",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#F5F7FF",
              },
              "& .MuiDataGrid-cell": {
                paddingInline: "10px",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #E5E7EB",
                backgroundColor: "#F9FAFB",
              },
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default Employees;
