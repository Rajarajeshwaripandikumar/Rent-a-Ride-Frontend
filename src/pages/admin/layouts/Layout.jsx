// src/layout/Layout.jsx
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#F1F5F9", // soft slate background to match dashboard
        display: "flex",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      {/* Main content wrapper */}
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          bgcolor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #E2E8F0", // light gray border
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)", // subtle clean shadow
          padding: "20px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
