import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationListener from "@/components/providers/NotificationListener";
import PresenceProvider from "@/components/providers/PresenceProvider";

export default function App({ Component, pageProps }) {
  return (
<SessionProvider session={pageProps.session}>
  <NotificationProvider>
    <NotificationListener />
    <PresenceProvider />
    <Component {...pageProps} />
  </NotificationProvider>
</SessionProvider>
  );
}