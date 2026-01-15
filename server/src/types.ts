export type UserState = {
  id: string;
  name: string;
  card: string | null;
  hasVoted: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  lastSeen: number;
  socketId?: string;
};

export type RoomState = {
  code: string;
  name: string;
  roomId: number;
  adminUserId: string;
  reveal: boolean;
  users: Map<string, UserState>;
};

export type PublicUser = {
  id: string;
  name: string;
  hasVoted: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  card: string | null;
};

export type PublicRoom = {
  code: string;
  name: string;
  reveal: boolean;
  users: PublicUser[];
};
