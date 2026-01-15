import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import ParticipantList, { Participant } from "../components/ParticipantList";
import PokerCards, { CARD_VALUES } from "../components/PokerCards";
import TopBar from "../components/TopBar";
import { getCookie, setCookie } from "../utils/cookies";

const NAME_COOKIE = "pp_name";
const USER_COOKIE = "pp_user_id";
const RANDOM_PAIR_COOKIE = "pp_random_pair";

type RoomState = {
  code: string;
  name: string;
  reveal: boolean;
  users: Participant[];
};

const parseNumericVote = (card: string | null) => {
  if (!card) return null;
  const value = Number(card);
  return Number.isFinite(value) ? value : null;
};

const Room = () => {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [room, setRoom] = React.useState<RoomState | null>(null);
  const [name, setName] = React.useState(() => getCookie(NAME_COOKIE) || "");
  const [userId, setUserId] = React.useState(() => getCookie(USER_COOKIE) || "");
  const [selectedCards, setSelectedCards] = React.useState<string[]>([]);
  const [allowRandomPair, setAllowRandomPair] = React.useState(() => getCookie(RANDOM_PAIR_COOKIE) === "true");
  const [nameDialogOpen, setNameDialogOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const hasJoinedRef = React.useRef(false);

  const currentUser = room?.users.find((user) => user.id === userId);
  const isAdmin = currentUser?.isAdmin ?? false;
  const votedCount = room?.users.filter((user) => user.hasVoted).length ?? 0;
  const totalCount = room?.users.length ?? 0;
  const averageVote = React.useMemo(() => {
    if (!room?.reveal) return null;
    const numericVotes = room.users
      .map((user) => parseNumericVote(user.card))
      .filter((value): value is number => value !== null);
    if (numericVotes.length === 0) return null;
    const sum = numericVotes.reduce((total, value) => total + value, 0);
    return sum / numericVotes.length;
  }, [room]);

  React.useEffect(() => {
    if (!userId) {
      const newId = crypto.randomUUID();
      setCookie(USER_COOKIE, newId);
      setUserId(newId);
    }
  }, [userId]);

  React.useEffect(() => {
    if (!name.trim()) {
      setNameDialogOpen(true);
    }
  }, [name]);

  React.useEffect(() => {
    const newSocket = io({ autoConnect: false });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (!socket) return;

    const handleRoomState = (state: RoomState) => setRoom(state);
    const handleRoomError = (payload: { message?: string }) => {
      setError(payload?.message || "Something went wrong with the room.");
    };
    const handleKicked = () => navigate("/");

    socket.on("room-state", handleRoomState);
    socket.on("room-error", handleRoomError);
    socket.on("kicked", handleKicked);

    return () => {
      socket.off("room-state", handleRoomState);
      socket.off("room-error", handleRoomError);
      socket.off("kicked", handleKicked);
    };
  }, [socket, navigate]);

  React.useEffect(() => {
    if (!socket || !userId || !code || !name.trim() || hasJoinedRef.current) return;
    socket.connect();
    socket.emit("join-room", { roomCode: code, userId, name: name.trim() });
    hasJoinedRef.current = true;
  }, [socket, userId, code, name]);

  React.useEffect(() => {
    if (room && !room.reveal && !currentUser?.hasVoted) {
      setSelectedCards([]);
    }
  }, [room, currentUser?.hasVoted]);

  React.useEffect(() => {
    if (!room?.reveal || !currentUser?.card) return;
    setSelectedCards([currentUser.card]);
  }, [room?.reveal, currentUser?.card]);

  React.useEffect(() => {
    setCookie(RANDOM_PAIR_COOKIE, allowRandomPair ? "true" : "false");
  }, [allowRandomPair]);

  React.useEffect(() => {
    if (allowRandomPair || selectedCards.length <= 1) return;
    setSelectedCards([selectedCards[0]]);
  }, [allowRandomPair, selectedCards]);

  const isNumericCard = (card: string) => Number.isFinite(Number(card));
  const isAdjacentCard = (first: string, second: string) => {
    const firstIndex = CARD_VALUES.indexOf(first);
    const secondIndex = CARD_VALUES.indexOf(second);
    return firstIndex >= 0 && secondIndex >= 0 && Math.abs(firstIndex - secondIndex) === 1;
  };

  const handleVote = (card: string) => {
    if (!socket) return;
    if (
      allowRandomPair &&
      selectedCards.length === 1 &&
      isNumericCard(card) &&
      isNumericCard(selectedCards[0]) &&
      isAdjacentCard(selectedCards[0], card)
    ) {
      const firstIndex = CARD_VALUES.indexOf(selectedCards[0]);
      const secondIndex = CARD_VALUES.indexOf(card);
      const ordered = firstIndex < secondIndex ? [selectedCards[0], card] : [card, selectedCards[0]];
      setSelectedCards(ordered);
      socket.emit("vote", { card: `RANDOM:${ordered[0]},${ordered[1]}` });
      return;
    }

    setSelectedCards([card]);
    socket.emit("vote", { card });
  };

  const handleReveal = () => {
    socket?.emit("reveal-cards");
  };

  const handleReset = () => {
    socket?.emit("reset-round");
  };

  const handleKick = (targetId: string) => {
    socket?.emit("kick-user", { userId: targetId });
  };

  const handleLeave = () => {
    socket?.emit("leave-room");
    navigate("/");
  };

  const handleNameSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCookie(NAME_COOKIE, trimmed);
    setName(trimmed);
    socket?.emit("change-name", { name: trimmed });
    setNameDialogOpen(false);
  };

  const shareLink = `${window.location.origin}/room/${code}`;

  return (
    <Box>
      <TopBar
        roomCode={code}
        roomName={room?.name}
        name={name || "Guest"}
        onEditName={() => setNameDialogOpen(true)}
        onLeave={handleLeave}
        onCopyLink={() => navigator.clipboard.writeText(shareLink)}
        allowRandomPair={allowRandomPair}
        onToggleRandomPair={() => setAllowRandomPair((prev) => !prev)}
      />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Voting
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 0.5, sm: 2 }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      sx={{ minHeight: { xs: "3rem", sm: "1.75rem" } }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color="text.secondary"
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        {votedCount} of {totalCount} voted
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: "success.dark", visibility: room?.reveal ? "visible" : "hidden" }}
                        fontSize={{ xs: "1rem", sm: "1.25rem" }}
                      >
                        Avg {averageVote !== null ? averageVote.toFixed(1) : "N/A"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ minWidth: { xs: 150, sm: "auto" } }}>
                    <Button variant="contained" onClick={handleReveal}>
                      Reveal cards
                    </Button>
                    <Button variant="outlined" onClick={handleReset}>
                      New round
                    </Button>
                  </Stack>
                </Stack>
                <Divider />
                <PokerCards selectedCards={selectedCards} reveal={room?.reveal ?? false} onSelect={handleVote} />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Participants
                </Typography>
                <ParticipantList
                  users={room?.users ?? []}
                  currentUserId={userId}
                  canKick={isAdmin}
                  reveal={room?.reveal ?? false}
                  onKick={handleKick}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>

      <Dialog open={nameDialogOpen} onClose={() => setNameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Set name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your name"
            fullWidth
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNameDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleNameSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Room;
