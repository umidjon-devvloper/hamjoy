import { io, type Socket } from 'socket.io-client';
import { API_URL, tokens } from './api';

let socket: Socket | null = null;
let connectedWith: string | null = null;

export async function getSocket(): Promise<Socket | null> {
  const token = await tokens.getAccess();
  if (!token) return null;
  if (socket && connectedWith === token) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connectedWith = token;
  socket = io(`${API_URL}/ws`, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return socket;
}

export function closeSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectedWith = null;
  }
}
