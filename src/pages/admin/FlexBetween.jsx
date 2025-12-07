import { Box } from "@mui/material";
import { styled } from "@mui/system";

/**
 * A reusable FlexBetween container (display:flex + space-between + center-align)
 * Accepts all Box props, sx, className, etc.
 */
const FlexBetween = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export default FlexBetween;
