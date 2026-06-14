import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationListener from "@/components/providers/NotificationListener";
import PresenceProvider from "@/components/providers/PresenceProvider";

const ClientAppEffects = dynamic(
  () => import("@/components/providers/ClientAppEffects"),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
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
