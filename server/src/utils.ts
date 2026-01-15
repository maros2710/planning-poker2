import crypto from "crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_ADJECTIVES = [
  "Amber",
  "Brisk",
  "Calm",
  "Clever",
  "Golden",
  "Lucky",
  "Mellow",
  "Quiet",
  "Rapid",
  "Sunny",
  "Vivid",
  "Warm"
];
const ROOM_NOUNS = [
  "Beacon",
  "Canyon",
  "Comet",
  "Harbor",
  "Meadow",
  "Orchard",
  "Panda",
  "Peak",
  "River",
  "Rocket",
  "Signal",
  "Summit"
];

export function generateRoomCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return result;
}

export function generateRoomName(): string {
  const adjective = ROOM_ADJECTIVES[Math.floor(Math.random() * ROOM_ADJECTIVES.length)];
  const noun = ROOM_NOUNS[Math.floor(Math.random() * ROOM_NOUNS.length)];
  return `${adjective} ${noun}`;
}

export function nowMs(): number {
  return Date.now();
}

export function createUserId(): string {
  return crypto.randomUUID();
}
