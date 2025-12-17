// src/theme.js
import { createTheme } from "@mui/material/styles";

// 更新主題配色，使用高檔餐廳風格
const theme = createTheme({
  palette: {
    primary: {
      main: "#8B4513", // 深咖啡色
    },
    secondary: {
      main: "#D2B48C", // 米色
    },
    background: {
      default: "#FAF3E0", // 柔和的奶油色背景
    },
  },
  typography: {
    fontFamily: '"Playfair Display", "Roboto", serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontStyle: "italic",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          textTransform: "none",
          padding: "10px 20px",
          fontSize: "16px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "15px",
          padding: "20px",
        },
      },
    },
  },
});

export default theme;
