// src/components/admin/navbar/Navbar.jsx
import {
  DarkModeOutlined,
  LightModeOutlined,
  Menu as MenuIcon,
  Search,
  Settings,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  InputBase,
  Toolbar,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addVehicleClicked } from "../../../redux/adminSlices/actions";
import { showSidebarOrNot } from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice";

const Navbar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.adminDashboardSlice || {});

  const isDark = theme.palette.mode === "dark";

  const handleAddVehicle = () => {
    dispatch(addVehicleClicked(true));
  };

  const handleToggleSidebar = () => {
    dispatch(showSidebarOrNot(!activeMenu));
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "transparent",
        boxShadow: "none",
        borderBottom: "1px solid #E5E7EB", // soft light border instead of thick dark
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: isDark ? "background.default" : "#FFFFFF",
        }}
      >
        {/* LEFT: Menu + Search */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleToggleSidebar}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              p: 0.75,
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              "&:hover": {
                bgcolor: "#F3F4F6",
              },
            }}
            aria-label="Toggle sidebar"
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          {/* Search box – soft Walmart / cinema style */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              bgcolor: isDark ? "background.paper" : "#F9FAFB",
              px: 1.5,
              py: 0.5,
              minWidth: { xs: "160px", md: "260px" },
              boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
            }}
          >
            <InputBase
              placeholder="Search…"
              sx={{
                fontSize: 14,
                flex: 1,
              }}
            />
            <IconButton size="small">
              <Search sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* RIGHT: Add button + theme icon + settings */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            onClick={handleAddVehicle}
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 999,
              px: 2.5,
              py: 0.75,
              bgcolor: "#0071DC", // Walmart blue
              "&:hover": {
                bgcolor: "#0654BA",
              },
            }}
          >
            + Add
          </Button>

          <IconButton
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              p: 0.75,
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              "&:hover": {
                bgcolor: "#F3F4F6",
              },
            }}
          >
            {isDark ? (
              <DarkModeOutlined sx={{ fontSize: 22 }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: 22 }} />
            )}
          </IconButton>

          <IconButton
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              p: 0.75,
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              "&:hover": {
                bgcolor: "#F3F4F6",
              },
            }}
          >
            <Settings sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
