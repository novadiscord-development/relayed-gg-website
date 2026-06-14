import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

const ConnectionStatusContext = createContext(null);

export default function ConnectionStatusProvider({ children }) {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [pusherState, setPusherState] = useState("initialized");
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      setShowRestored(true);
      setWasOffline(false);

      setTimeout(() => setShowRestored(false), 2500);
    }

    function handleOffline() {
      setOnline(false);
      setWasOffline(true);
      setShowRestored(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setOnline(false);
      setWasOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let pusherClient;

    try {
      pusherClient = getPusherClient();
    } catch {
      return;
    }

    function updateState(state) {
      setPusherState(state);

      if (state === "connected" && wasOffline) {
        setShowRestored(true);
        setWasOffline(false);
        setTimeout(() => setShowRestored(false), 2500);
      }

      if (["unavailable", "failed", "disconnected"].includes(state)) {
        setWasOffline(true);
      }
    }

    updateState(pusherClient.connection.state);

    pusherClient.connection.bind("state_change", ({ current }) => {
      updateState(current);
    });

    pusherClient.connection.bind("connected", () => updateState("connected"));
    pusherClient.connection.bind("disconnected", () => updateState("disconnected"));
    pusherClient.connection.bind("unavailable", () => updateState("unavailable"));
    pusherClient.connection.bind("failed", () => updateState("failed"));

    return () => {
      pusherClient.connection.unbind("state_change");
      pusherClient.connection.unbind("connected");
      pusherClient.connection.unbind("disconnected");
      pusherClient.connection.unbind("unavailable");
      pusherClient.connection.unbind("failed");
    };
  }, [wasOffline]);

  function retryConnection() {
    if (typeof window !== "undefined" && !navigator.onLine) {
      setOnline(false);
      return;
    }

    try {
      const pusherClient = getPusherClient();

      if (pusherClient.connection.state !== "connected") {
        pusherClient.connect();
      }

      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("connection:retry"));
    } catch (error) {
      console.error("RETRY_CONNECTION_ERROR", error);
    }
  }

  const reconnecting =
    online &&
    ["connecting", "unavailable", "failed", "disconnected"].includes(pusherState);

  const value = useMemo(
    () => ({
      online,
      pusherState,
      reconnecting,
      showRestored,
      retryConnection,
    }),
    [online, pusherState, reconnecting, showRestored]
  );

  return (
    <ConnectionStatusContext.Provider value={value}>
      {children}
      <ConnectionBanner />
    </ConnectionStatusContext.Provider>
  );
}

function ConnectionBanner() {
  const { online, reconnecting, showRestored, retryConnection, pusherState } =
    useConnectionStatus();

  if (showRestored) {
    return (
      <div className="pointer-events-none fixed left-1/2 top-3 z-[20000] -translate-x-1/2 px-3">
        <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/15 px-4 py-2 text-sm font-black text-green-200 shadow-2xl backdrop-blur-xl">
          <CheckCircle2 size={16} />
          Connected
        </div>
      </div>
    );
  }

  if (!online) {
    return (
      <div className="fixed left-0 right-0 top-0 z-[20000] border-b border-red-500/20 bg-red-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <WifiOff size={18} className="shrink-0 text-red-300" />
            <div className="min-w-0">
              <p className="text-sm font-black text-red-100">No internet connection</p>
              <p className="truncate text-xs text-red-200/70">
                Messages may not send until you're back online.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={retryConnection}
            className="shrink-0 rounded-lg border border-red-300/20 bg-white/10 px-3 py-1.5 text-xs font-black text-red-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (reconnecting) {
    return (
      <div className="fixed left-0 right-0 top-0 z-[20000] border-b border-yellow-500/20 bg-yellow-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <RefreshCw size={18} className="shrink-0 animate-spin text-yellow-300" />
            <div className="min-w-0">
              <p className="text-sm font-black text-yellow-100">Reconnecting...</p>
              <p className="truncate text-xs text-yellow-200/70">
                Realtime updates are temporarily paused. State: {pusherState}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={retryConnection}
            className="shrink-0 rounded-lg border border-yellow-300/20 bg-white/10 px-3 py-1.5 text-xs font-black text-yellow-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export function useConnectionStatus() {
  const context = useContext(ConnectionStatusContext);

  if (!context) {
    throw new Error(
      "useConnectionStatus must be used inside ConnectionStatusProvider"
    );
  }

  return context;
}
