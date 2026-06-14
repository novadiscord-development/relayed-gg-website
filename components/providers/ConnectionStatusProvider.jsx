import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";

const ConnectionStatusContext = createContext(null);

export default function ConnectionStatusProvider({ children }) {
  const [online, setOnline] = useState(true);
  const [ready, setReady] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    setReady(true);
    setOnline(navigator.onLine);

    function handleOnline() {
      setOnline(true);
      setShowRestored(true);
      window.dispatchEvent(new Event("connection:retry"));

      setTimeout(() => {
        setShowRestored(false);
      }, 2500);
    }

    function handleOffline() {
      setOnline(false);
      setShowRestored(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function retryConnection() {
    const nextOnline = typeof navigator === "undefined" ? true : navigator.onLine;
    setOnline(nextOnline);

    if (nextOnline) {
      window.dispatchEvent(new Event("connection:retry"));
      window.dispatchEvent(new Event("focus"));
      setShowRestored(true);

      setTimeout(() => {
        setShowRestored(false);
      }, 2500);
    }
  }

  const value = useMemo(
    () => ({
      online,
      ready,
      reconnecting: false,
      pusherState: "ignored",
      showRestored,
      retryConnection,
    }),
    [online, ready, showRestored]
  );

  return (
    <ConnectionStatusContext.Provider value={value}>
      {children}
      <ConnectionBanner />
    </ConnectionStatusContext.Provider>
  );
}

function ConnectionBanner() {
  const { online, ready, showRestored, retryConnection } = useConnectionStatus();

  if (!ready) return null;

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
              <p className="text-sm font-black text-red-100">
                No internet connection
              </p>
              <p className="truncate text-xs text-red-200/70">
                Messages may not send until you&apos;re back online.
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

  return null;
}

export function useConnectionStatus() {
  const context = useContext(ConnectionStatusContext);

  if (!context) {
    return {
      online: true,
      ready: false,
      reconnecting: false,
      pusherState: "unmounted",
      showRestored: false,
      retryConnection: () => {},
    };
  }

  return context;
}
