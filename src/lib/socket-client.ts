"use client";

import { io, Socket } from "socket.io-client";

export interface CandidateTelemetry {
  id: string;
  socketId: string;
  studentId: string;
  name: string;
  email: string;
  examId: string;
  examTitle: string;
  progress: number;
  answeredCount: number;
  totalQuestions: number;
  timeRemaining: string;
  status: "Normal" | "Warning" | "Critical";
  tabSwitches: number;
  focusLossCount: number;
  lastPing: string;
  startedAt: string;
  hasCamera?: boolean;
  latestFrame?: string;
}

let socketInstance: Socket | null = null;

export function getMonitoringSocket(): Socket {
  if (typeof window === "undefined") {
    return null as any;
  }

  if (!socketInstance) {
    const serverUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
      "http://localhost:5000";

    socketInstance = io(serverUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on("connect", () => {
      console.log("🟢 [Socket.IO] Connected to monitoring gateway:", socketInstance?.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ [Socket.IO] Connection error:", err.message);
    });
  }

  return socketInstance;
}
