import { io, type Socket } from 'socket.io-client';
import { getJoymeeClient, joymeeTokens } from './client';

let socket: Socket | null = null;
let connectingToken: string | null = null;

/**
 * Return a lazily-created, auth'd Socket.io connection to the /ws namespace.
 * Reconnects with a fresh access token whenever one is set.
 */
export async function getJoymeeSocket(): Promise<Socket | null> {
  const token = await joymeeTokens.getAccess();
  if (!token) return null;

  if (socket && connectingToken === token) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  connectingToken = token;
  const baseUrl = getJoymeeClient().wsBaseUrl;
  socket = io(`${baseUrl}/ws`, {
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return socket;
}

export function closeJoymeeSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectingToken = null;
  }
}
