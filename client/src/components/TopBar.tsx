import React from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ThemeModeContext } from "../App";

type TopBarProps = {
  roomCode: string;
  roomName?: string;
  name: string;
  onEditName: () => void;
  onLeave: () => void;
  onCopyLink: () => void;
};

const TopBar = ({ roomCode, roomName, name, onEditName, onLeave, onCopyLink }: TopBarProps) => {
  const { mode, toggle } = React.useContext(ThemeModeContext);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider"
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
          <Typography variant="h6" fontWeight={700}>
            {roomName || `Room ${roomCode}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Signed in as {name}
          </Typography>
        </Box>
        <Tooltip title="Copy link">
          <IconButton color="inherit" onClick={onCopyLink}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit name">
          <IconButton color="inherit" onClick={onEditName}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle theme">
          <IconButton color="inherit" onClick={toggle}>
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
        <Button variant="outlined" color="inherit" onClick={onLeave} startIcon={<LogoutIcon />}>
          Leave
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
