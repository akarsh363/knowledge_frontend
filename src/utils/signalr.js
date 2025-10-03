import * as signalR from "@microsoft/signalr";
import { getAuth } from "./auth";

let connection = null;

function getBackendBase() {
  // Prefer the axios/env base you use for API calls if available, otherwise fallback.
  // Keep this local so we don't import api (preserves your existing structure).
  const envBase = import.meta.env.VITE_API_BASE;
  const fallback = "http://localhost:5058";
  const base = envBase || fallback;
  // strip trailing slash and optional trailing /api (so we don't end up with /api/api)
  return base.replace(/\/+$/, "").replace(/\/api$/i, "");
}

export function startSignalR() {
  const auth = getAuth();
  if (!auth?.token) {
    console.warn("No token found, cannot start SignalR");
    return null;
  }

  // Don't create duplicate connections
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log("SignalR already connected");
    return connection;
  }

  // derive hub url from backend base to avoid hard-coded ports
  const backendBase = getBackendBase();
  const hubUrl = `${backendBase}/hubs/notifications`;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => auth.token,
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: false, // ✅ Let SignalR negotiate transport
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 10000]) // ✅ Better reconnect strategy
    .build();

  // ✅ Add event listeners
  connection.onreconnecting((error) => {
    console.warn("SignalR reconnecting:", error);
  });

  connection.onreconnected((connectionId) => {
    console.log("SignalR reconnected:", connectionId);
  });

  connection.onclose((error) => {
    console.error("SignalR connection closed:", error);
  });

  // ✅ Start connection with error handling
  connection
    .start()
    .then(() => {
      console.log("✅ SignalR Connected successfully to", hubUrl);
    })
    .catch((err) => {
      console.error("❌ SignalR connection error:", err);
    });

  return connection;
}

export function getConnection() {
  return connection;
}

export function stopSignalR() {
  if (connection) {
    connection.stop();
    connection = null;
  }
}
