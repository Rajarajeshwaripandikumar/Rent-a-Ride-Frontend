import { GrStatusGood } from "react-icons/gr";
import { MdOutlinePending } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { useEffect } from "react";

import {
  setUpdateRequestTable,
  setVendorVehicles,
  setAdminVendorRequests,
} from "../../../redux/vendor/vendorDashboardSlice";

// ✅ central API wrapper
import { api } from "../../../api";

const VenderVehicleRequests = () => {
  const { adminVendorRequests } = useSelector(
    (state) => state.vendorDashboardSlice
  );
  const dispatch = useDispatch();

  /* ======================================================
     FETCH VENDOR REQUESTS (pending only)
  ====================================================== */
  useEffect(() => {
    const fetchVendorRequest = async () => {
      try {
        // ✅ use api.get so Authorization + cookies + base URL are handled
        const data = await api.get("/api/admin/fetchVendorVehilceRequests");

        const requests = Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data)
          ? data
          : [];

        dispatch(setVendorVehicles(requests));
        dispatch(setAdminVendorRequests(requests));
      } catch (error) {
        console.error("Failed to fetch vendor requests:", error);
      }
    };

    fetchVendorRequest();
  }, [dispatch]);

  /* ======================================================
     APPROVE VENDOR VEHICLE
  ====================================================== */
  const handleApproveRequest = async (id) => {
    try {
      dispatch(setUpdateRequestTable(id));

      await api.post("/api/admin/approveVendorVehicleRequest", { _id: id });
      // backend should update Redux via refetch or socket;
      // if needed you can refetch list here
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  /* ======================================================
     REJECT VENDOR VEHICLE
  ====================================================== */
  const handleReject = async (id) => {
    try {
      dispatch(setUpdateRequestTable(id));

      await api.post("/api/admin/rejectVendorVehicleRequest", { _id: id });
      // same here: optionally refetch
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  /* ======================================================
     DATAGRID COLUMNS
  ====================================================== */
  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 110,
      renderCell: (params) => (
        <img
          src={params.value}
          style={{
            width: "50px",
            height: "40px",
            borderRadius: "6px",
            objectFit: "cover",
          }}
          alt="vehicle"
        />
      ),
    },
    { field: "registeration_number", headerName: "Register No", width: 160 },
    { field: "company", headerName: "Company", width: 150 },
    { field: "name", headerName: "Name", width: 150 },

    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) =>
        params.value ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-[11px] font-medium text-yellow-700">
            <MdOutlinePending className="text-sm" />
            <span>Pending</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
            <GrStatusGood className="text-sm" />
            <span>Approved</span>
          </div>
        ),
    },

    {
      field: "Approve",
      headerName: "Approve",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleApproveRequest(params.row.id)}
          size="small"
          sx={{
            minWidth: 0,
            padding: 0.5,
          }}
        >
          <GrStatusGood style={{ color: "#16A34A", fontSize: 20 }} />
        </Button>
      ),
    },

    {
      field: "Reject",
      headerName: "Reject",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleReject(params.row.id)}
          size="small"
          sx={{
            minWidth: 0,
            padding: 0.5,
          }}
        >
          <IoIosCloseCircle style={{ color: "#DC2626", fontSize: 22 }} />
        </Button>
      ),
    },
  ];

  /* ======================================================
     DATAGRID ROWS
  ====================================================== */
  const rows =
    adminVendorRequests &&
    adminVendorRequests
      .filter((v) => v.isDeleted === false)
      .map((v) => ({
        id: v._id,
        image: v.image?.[0],
        registeration_number: v.registeration_number,
        company: v.company,
        name: v.name,
        status: !v.isAdminApproved, // pending = true
      }));

  /* ======================================================
     EMPTY CHECK
  ====================================================== */
  const isEmpty =
    !adminVendorRequests || adminVendorRequests.length === 0;

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 select-none w-full">
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
          Vendor Requests
        </span>

        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
          Vehicle Approval Requests
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Review and approve or reject vehicles submitted by vendors.
        </p>
      </div>

      {/* CONTENT CARD */}
      <div
        className="
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-sm
          p-4 sm:p-5
        "
      >
        {isEmpty ? (
          <div className="text-sm text-slate-500 py-4">
            No vendor vehicle requests yet.
          </div>
        ) : (
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: rows.length > 10 ? 10 : 5,
                  },
                },
              }}
              pageSizeOptions={[5, 10]}
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
                  fontSize: "0.8rem",
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
        )}
      </div>
    </div>
  );
};

export default VenderVehicleRequests;
