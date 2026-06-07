import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const HEARTBEAT_INTERVAL = 30000;
const IDLE_AFTER = 5 * 60 * 1000;

export default function PresenceProvider() {
  const { data: session } = useSession();

  const lastActivityAtRef = useRef(Date.now());
  const heartbeatIntervalRef = useRef(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    function markActive() {
      lastActivityAtRef.current = Date.now();
    }

    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);
    window.addEventListener("click", markActive);
    window.addEventListener("scroll", markActive);

    sendHeartbeat();

    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL);

    return () => {
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("click", markActive);
      window.removeEventListener("scroll", markActive);

      clearInterval(heartbeatIntervalRef.current);
    };
  }, [session?.user?.id]);

  async function sendHeartbeat() {
    const idle = Date.now() - lastActivityAtRef.current > IDLE_AFTER;

    fetch("/api/presence/heartbeat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idle }),
    }).catch(() => {});
  }

  return null;
}