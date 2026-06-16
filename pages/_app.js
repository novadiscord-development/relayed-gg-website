import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationListener from "@/components/providers/NotificationListener";
import PresenceProvider from "@/components/providers/PresenceProvider";
import MaintenancePage from "@/pages/maintainance";

const ClientAppEffects = dynamic(
  () => import("@/components/providers/ClientAppEffects"),
  { ssr: false }
);

const maintenanceMode =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const isAppRoute = router.pathname.startsWith("/app");

  const shouldShowAppLoader =
    router.pathname === "/app" ||
    router.pathname === "/app/index" ||
    router.pathname === "/app/me";

  if (maintenanceMode && isAppRoute) {
    return (
      <SessionProvider session={pageProps.session}>
        <MaintenancePage />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={pageProps.session}>
      <NotificationProvider>
        {shouldShowAppLoader && <ClientAppEffects />}

        {isAppRoute && <NotificationListener />}
        {isAppRoute && <PresenceProvider />}

        <Component {...pageProps} />
      </NotificationProvider>
    </SessionProvider>
  );
}