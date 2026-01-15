import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "../utils/cookies";

const NAME_COOKIE = "pp_name";
const USER_COOKIE = "pp_user_id";

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = React.useState(() => getCookie(NAME_COOKIE) || "");
  const [roomInput, setRoomInput] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const ensureUserId = () => {
    let id = getCookie(USER_COOKIE);
    if (!id) {
      id = crypto.randomUUID();
      setCookie(USER_COOKIE, id);
    }
    return id;
  };

  const handleCreateRoom = async () => {
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter your name before creating a room.");
      return;
    }

    setCookie(NAME_COOKIE, trimmedName);
    const adminUserId = ensureUserId();

    setLoading(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId })
      });
      if (!response.ok) {
        throw new Error("Room creation failed");
      }
      const data = await response.json();
      navigate(`/room/${data.code}`);
    } catch (err) {
      setError("Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  const normalizeRoomCode = (value: string) => {
    const trimmed = value.trim();
    const match = trimmed.match(/room\/([A-Za-z0-9]+)/i);
    const code = match ? match[1] : trimmed;
    return code.toUpperCase();
  };

  const handleJoinRoom = () => {
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter your name before joining a room.");
      return;
    }

    const code = normalizeRoomCode(roomInput);
    if (!code) {
      setError("Enter a room code or link.");
      return;
    }

    setCookie(NAME_COOKIE, trimmedName);
    ensureUserId();
    navigate(`/room/${code}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Planning Poker
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Fast estimation voting with cards and a clear team overview.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="For example, Eva"
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCreateRoom}
                  disabled={loading}
                  fullWidth
                >
                  Create room
                </Button>
                <TextField
                  label="Room code or link"
                  value={roomInput}
                  onChange={(event) => setRoomInput(event.target.value)}
                  placeholder="AB12CD"
                  fullWidth
                />
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleJoinRoom}
                  fullWidth
                >
                  Join
                </Button>
              </Stack>
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default Home;
