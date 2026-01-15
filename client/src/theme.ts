import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export const createAppTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#2563eb" : "#60a5fa"
      },
      secondary: {
        main: mode === "light" ? "#0f766e" : "#5eead4"
      },
      background: {
        default: mode === "light" ? "#eef2ff" : "#0f172a",
        paper: mode === "light" ? "#ffffff" : "#111827"
      }
    },
    shape: {
      borderRadius: 12
    }
  });
