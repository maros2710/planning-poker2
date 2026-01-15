import { PublicRoom, PublicUser, RoomState, UserState } from "./types.js";
import { nowMs } from "./utils.js";

const rooms = new Map<string, RoomState>();

export function getRoomState(code: string): RoomState | undefined {
  return rooms.get(code);
}

export function getOrCreateRoomState(code: string, name: string, roomId: number, adminUserId: string): RoomState {
  const existing = rooms.get(code);
  if (existing) {
    if (!existing.adminUserId) {
      existing.adminUserId = adminUserId;
    }
    if (!existing.name) {
      existing.name = name;
    }
    return existing;
  }

  const newRoom: RoomState = {
    code,
    name,
    roomId,
    adminUserId,
    reveal: false,
    users: new Map()
  };
  rooms.set(code, newRoom);
  return newRoom;
}

export function setUserOnline(room: RoomState, userId: string, name: string, isAdmin: boolean, socketId: string): UserState {
  const existing = room.users.get(userId);
  const user: UserState = existing || {
    id: userId,
    name,
    card: null,
    hasVoted: false,
    isAdmin,
    isOnline: true,
    lastSeen: nowMs()
  };

  user.name = name;
  user.isAdmin = isAdmin;
  user.isOnline = true;
  user.lastSeen = nowMs();
  user.socketId = socketId;

  room.users.set(userId, user);
  return user;
}

export function setUserOffline(room: RoomState, userId: string): void {
  const user = room.users.get(userId);
  if (!user) return;
  user.isOnline = false;
  user.lastSeen = nowMs();
}

export function removeUser(room: RoomState, userId: string): void {
  room.users.delete(userId);
}

export function clearRoomVotes(room: RoomState): void {
  room.reveal = false;
  for (const user of room.users.values()) {
    user.card = null;
    user.hasVoted = false;
  }
}

export function getPublicState(room: RoomState): PublicRoom {
  const users: PublicUser[] = [];
  for (const user of room.users.values()) {
    users.push({
      id: user.id,
      name: user.name,
      hasVoted: user.hasVoted,
      isAdmin: user.isAdmin,
      isOnline: user.isOnline,
      card: room.reveal ? user.card : null
    });
  }

  return {
    code: room.code,
    name: room.name,
    reveal: room.reveal,
    users
  };
}

export function getAllRooms(): RoomState[] {
  return Array.from(rooms.values());
}
