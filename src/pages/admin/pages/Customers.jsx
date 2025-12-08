// src/pages/admin/pages/Customers.jsx
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

// central API wrapper
import { api } from "../../../api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const data = await api.get("/api/admin/users");

      const list = Array.isArray(data?.users) ? data.users : [];
      setCustomers(list);
    } catch (err) {
      console.error("[Customers] Error fetching customers:", err);
      setCustomers([]);
      setErrorMsg(err?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const columns = [
    {
      field: "profilePicture",
      headerName: "Avatar",
      width: 90,
      renderCell: (params) => (
        <img
          src={params.value || "/placeholder-user.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border border-gray-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder-user.png";
          }}
        />
      ),
    },
    { field: "username", headerName: "Name", width: 180 },

    // ★★★★★ FIXED EMAIL FULL VISIBILITY ★★★★★
    {
      field: "email",
      headerName: "Email",
      width: 280,
      renderCell: (params) => (
        <div
          title={params.value} // full email on hover
          style={{
            maxWidth: "260px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {params.value}
        </div>
      ),
    },

    {
      field: "phoneNumber",
      headerName: "Phone",
      width: 160,
      renderCell: (params) => params.value || "—",
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 140,
      renderCell: (params) => formatDate(params.value),
    },
  ];

  const rows = customers.map((cust) => ({
    id: cust._id,
    username: cust.username,
    email: cust.email,
    phoneNumber: cust.phoneNumber,
    profilePicture: cust.profilePicture,
    createdAt: cust.createdAt,
  }));

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 select-none">
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
          Customers
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
          Customer Management
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          View and manage registered customers.
        </p>
      </div>

      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-5 sm:p-6 lg:p-8
        "
      >
        {errorMsg && (
          <p className="text-xs text-red-500 mb-3">{errorMsg}</p>
        )}

        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[5, 8, 10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 8 } },
            }}
            sx={{
              border: "none",
              backgroundColor: "#FFFFFF",
              borderRadius: "0.75rem",
              ".MuiDataGrid-columnHeaders": {
                backgroundColor: "#F9FAFB",
                borderBottom: "1px solid #E5E7EB",
                fontWeight: 600,
                fontSize: "0.78rem",
                color: "#4B5563",
              },
              ".MuiDataGrid-row": {
                borderBottom: "1px solid #F3F4F6",
              },
              ".MuiDataGrid-row:hover": {
                backgroundColor: "#F5F7FF",
              },
              ".MuiDataGrid-cell": {
                paddingInline: "10px",
              },
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default Customers;
