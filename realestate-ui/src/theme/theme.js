import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0F3D66", // dark blue navbar
    },
    secondary: {
      main: "#1976D2", // search button
    },
  },
  typography: {
    fontFamily: "'Open Sans', 'Segoe UI', Arial, sans-serif",
  },
});

export default theme;
