import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import pool from "./db.js";
import {
  clearRoomVotes,
  getAllRooms,
  getOrCreateRoomState,
  getRoomState,
  getPublicState,
  removeUser,
  setUserOffline,
  setUserOnline
} from "./roomStore.js";
import { createUserId, generateRoomCode, generateRoomName, nowMs } from "./utils.js";

dotenv.config();

const proxyUrl = process.env.PROXY_URL;
if (proxyUrl) {
  process.env.HTTP_PROXY ||= proxyUrl;
  process.env.HTTPS_PROXY ||= proxyUrl;
}
process.env.NO_PROXY ||= "localhost,127.0.0.1";

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/rooms", async (req, res) => {
  try {
    const adminUserId = req.body?.adminUserId || createUserId();
    let code = generateRoomCode();
    const name = generateRoomName();

    // Ensure unique room code.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const [existing] = await pool.query("SELECT id FROM rooms WHERE code = ?", [code]);
      if (Array.isArray(existing) && existing.length === 0) break;
      code = generateRoomCode();
    }

    const [result] = await pool.query(
      "INSERT INTO rooms (code, name, admin_user_id) VALUES (?, ?, ?)",
      [code, name, adminUserId]
    );

    res.json({ code, name, adminUserId, roomId: (result as any).insertId });
  } catch (error) {
    console.error("Failed to create room:", error);
    res.status(500).json({ error: "Failed to create room." });
  }
});

app.get("/api/rooms/:code", async (req, res) => {
  const { code } = req.params;
  const [rows] = await pool.query("SELECT id, name, admin_user_id FROM rooms WHERE code = ?", [code]);
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(404).json({ exists: false });
    return;
  }

  res.json({ exists: true });
});

if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true
  }
});

async function upsertMember(roomId: number, userId: string, name: string, isAdmin: boolean) {
  await pool.query(
    "INSERT INTO room_members (room_id, user_id, name, is_admin) VALUES (?, ?, ?, ?) " +
      "ON DUPLICATE KEY UPDATE name = VALUES(name), is_admin = VALUES(is_admin), last_seen = CURRENT_TIMESTAMP",
    [roomId, userId, name, isAdmin ? 1 : 0]
  );
}

async function markMemberSeen(roomId: number, userId: string) {
  await pool.query(
    "UPDATE room_members SET last_seen = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ?",
    [roomId, userId]
  );
}

io.on("connection", (socket) => {
  socket.on(
    "join-room",
    async (payload: { roomCode?: string; userId?: string; name?: string }) => {
    const roomCode = String(payload?.roomCode || "").toUpperCase();
    const userId = String(payload?.userId || "");
    const name = String(payload?.name || "Guest");

    if (!roomCode || !userId) {
      socket.emit("room-error", { message: "Missing room or user data." });
      return;
    }

    const [rows] = await pool.query("SELECT id, name, admin_user_id FROM rooms WHERE code = ?", [roomCode]);
    if (!Array.isArray(rows) || rows.length === 0) {
      socket.emit("room-error", { message: "Room not found." });
      return;
    }

    const roomRow = rows[0] as { id: number; name: string; admin_user_id: string };
    const room = getOrCreateRoomState(roomCode, roomRow.name, roomRow.id, roomRow.admin_user_id);
    const isAdmin = userId === room.adminUserId;

    setUserOnline(room, userId, name, isAdmin, socket.id);
    await upsertMember(room.roomId, userId, name, isAdmin);

    socket.data.roomCode = roomCode;
    socket.data.userId = userId;

    socket.join(roomCode);
    io.to(roomCode).emit("room-state", getPublicState(room));
  });

  socket.on("vote", (payload: { card?: string }) => {
    const roomCode = socket.data.roomCode;
    const userId = socket.data.userId;
    if (!roomCode || !userId) return;

    const room = getRoomState(roomCode);
    if (!room) return;
    const user = room.users.get(userId);
    if (!user) return;

    const card = String(payload?.card || "");
    user.card = card;
    user.hasVoted = true;

    io.to(roomCode).emit("room-state", getPublicState(room));
  });

  socket.on("reveal-cards", () => {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;
    const room = getRoomState(roomCode);
    if (!room) return;
    for (const user of room.users.values()) {
      if (user.card && user.card.startsWith("RANDOM:")) {
        const options = user.card
          .replace("RANDOM:", "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        if (options.length >= 2) {
          const choice = options[Math.floor(Math.random() * options.length)];
          user.card = choice;
        }
      }
    }
    room.reveal = true;
    io.to(roomCode).emit("room-state", getPublicState(room));
  });

  socket.on("reset-round", () => {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;
    const room = getRoomState(roomCode);
    if (!room) return;
    clearRoomVotes(room);
    io.to(roomCode).emit("room-state", getPublicState(room));
  });

  socket.on("change-name", async (payload: { name?: string }) => {
    const roomCode = socket.data.roomCode;
    const userId = socket.data.userId;
    if (!roomCode || !userId) return;

    const room = getRoomState(roomCode);
    if (!room) return;
    const user = room.users.get(userId);
    if (!user) return;

    const name = String(payload?.name || "Guest");
    user.name = name;
    user.lastSeen = nowMs();

    if (room.roomId) {
      await upsertMember(room.roomId, userId, name, user.isAdmin);
    }

    io.to(roomCode).emit("room-state", getPublicState(room));
  });

  socket.on("leave-room", async () => {
    const roomCode = socket.data.roomCode;
    const userId = socket.data.userId;
    if (!roomCode || !userId) return;

    const room = getRoomState(roomCode);
    if (!room) return;
    removeUser(room, userId);

    if (room.roomId) {
      await markMemberSeen(room.roomId, userId);
    }

    socket.leave(roomCode);
    io.to(roomCode).emit("room-state", getPublicState(room));
  });

  socket.on("kick-user", (payload: { userId?: string }) => {
    const roomCode = socket.data.roomCode;
    const userId = socket.data.userId;
    if (!roomCode || !userId) return;

    const room = getRoomState(roomCode);
    if (!room) return;
    const requester = room.users.get(userId);
    if (!requester?.isAdmin) return;

    const targetId = String(payload?.userId || "");
    const target = room.users.get(targetId);
    if (!target) return;

    if (target.socketId) {
      io.to(target.socketId).emit("kicked");
    }

    removeUser(room, targetId);
    io.to(roomCode).emit("room-state", getPublicState(room));
  });

  socket.on("disconnect", async () => {
    const roomCode = socket.data.roomCode;
    const userId = socket.data.userId;
    if (!roomCode || !userId) return;

    const room = getRoomState(roomCode);
    if (!room) return;
    setUserOffline(room, userId);

    if (room.roomId) {
      await markMemberSeen(room.roomId, userId);
    }

    io.to(roomCode).emit("room-state", getPublicState(room));
  });
});

setInterval(() => {
  const rooms = getAllRooms();
  const cutoff = nowMs() - 15 * 60 * 1000;
  for (const room of rooms) {
    for (const user of room.users.values()) {
      if (!user.isOnline && user.lastSeen < cutoff) {
        room.users.delete(user.id);
      }
    }
  }
}, 60 * 1000);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
