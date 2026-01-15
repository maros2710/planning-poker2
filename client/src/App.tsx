import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import { createAppTheme, ThemeMode } from "./theme";

const THEME_KEY = "pp_theme";

export const ThemeModeContext = React.createContext({
  mode: "light" as ThemeMode,
  toggle: () => {}
});

const App = () => {
  const [mode, setMode] = React.useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return stored || "light";
  });

  React.useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  const toggle = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeModeContext.Provider value={{ mode, toggle }}>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:code" element={<Room />} />
          </Routes>
        </div>
      </ThemeModeContext.Provider>
    </ThemeProvider>
  );
};

export default App;
