import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationListener from "@/components/providers/NotificationListener";

export default function App({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <NotificationListener />
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
    </NotificationProvider>
  );
}