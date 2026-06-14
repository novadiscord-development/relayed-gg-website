import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationListener from "@/components/providers/NotificationListener";
import PresenceProvider from "@/components/providers/PresenceProvider";
import ConnectionStatusProvider from "@/components/providers/ConnectionStatusProvider";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <ConnectionStatusProvider>
        <NotificationProvider>
          <NotificationListener />
          <PresenceProvider />
          <Component {...pageProps} />
        </NotificationProvider>
      </ConnectionStatusProvider>
    </SessionProvider>
  );
}
