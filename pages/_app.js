import "@/styles/globals.css";
import dynamic from "next/dynamic";
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
  if (maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <SessionProvider session={pageProps.session}>
      <NotificationProvider>
        <ClientAppEffects />
        <NotificationListener />
        <PresenceProvider />
        <Component {...pageProps} />
      </NotificationProvider>
    </SessionProvider>
  );
}