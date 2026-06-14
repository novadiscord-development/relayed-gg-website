import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppLoader from "@/components/app/AppLoader";
import { CheckCircle2, WifiOff } from "lucide-react";

export default function ClientAppEffects() {
  const router = useRouter();

  const [appLoading, setAppLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [ready, setReady] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    let timeout;

    function finishLoading() {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setAppLoading(false);
      }, 450);
    }

    function startLoading() {
      setAppLoading(true);
    }

    finishLoading();

    router.events.on("routeChangeStart", startLoading);
    router.events.on("routeChangeComplete", finishLoading);
    router.events.on("routeChangeError", finishLoading);

    return () => {
      clearTimeout(timeout);
      router.events.off("routeChangeStart", startLoading);
      router.events.off("routeChangeComplete", finishLoading);
      router.events.off("routeChangeError", finishLoading);
    };
  }, [router.events]);

  useEffect(() => {
    setReady(true);
    setOnline(navigator.onLine);

    function handleOnline() {
      setOnline(true);
      setShowRestored(true);

      window.dispatchEvent(new Event("connection:retry"));
      window.dispatchEvent(new Event("focus"));

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
    const isOnline = navigator.onLine;
    setOnline(isOnline);

    if (isOnline) {
      window.dispatchEvent(new Event("connection:retry"));
      window.dispatchEvent(new Event("focus"));
      setShowRestored(true);

      setTimeout(() => {
        setShowRestored(false);
      }, 2500);
    }
  }

  return (
    <>
      {appLoading && <AppLoader />}

      {ready && showRestored && (
        <div className="pointer-events-none fixed left-1/2 top-3 z-[20000] -translate-x-1/2 px-3">
          <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/15 px-4 py-2 text-sm font-black text-green-200 shadow-2xl backdrop-blur-xl">
            <CheckCircle2 size={16} />
            Connected
          </div>
        </div>
      )}

      {ready && !online && (
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
      )}
    </>
  );
}
