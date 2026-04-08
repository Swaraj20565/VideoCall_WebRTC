import { io, Socket } from "socket.io-client";

// Define types for better safety
export interface ServerToClientEvents {
  "other-user": (userId: string) => void;
  "user-joined": (userId: string) => void;
  "offer": (payload: any) => void;
  "answer": (payload: any) => void;
  "ice-candidate": (payload: any) => void;
}

export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "offer": (payload: any) => void;
  "answer": (payload: any) => void;
  "ice-candidate": (payload: any) => void;
}

// Create typed socket
const URL = "http://localhost:5000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(URL);