// src/types/next.d.ts
import type { Server as HTTPServer } from "http";
import type { Socket } from "net";
import type { Server as IOServer } from "socket.io";

declare module "net" {
  interface Socket {
    server: HTTPServer & { io?: IOServer };
  }
}

declare module "http" {
  interface Server {
    io?: IOServer;
  }
}

export interface NextApiResponseServerIO extends import("next").NextApiResponse {
  socket: Socket & { server: HTTPServer & { io?: IOServer } };
}
