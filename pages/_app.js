import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationListener from "@/components/providers/NotificationListener";
import PresenceProvider from "@/components/providers/PresenceProvider";
import ConnectionStatusProvider from "@/components/providers/ConnectionStatusProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppLoader from "@/components/app/AppLoader";

const router = useRouter();

const [loading, setLoading] = useState(true);

useEffect(() => {
  const finishLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  finishLoad();

  router.events.on("routeChangeStart", () => {
    setLoading(true);
  });

  router.events.on("routeChangeComplete", finishLoad);
  router.events.on("routeChangeError", finishLoad);

  return () => {
    router.events.off("routeChangeStart", () => {});
    router.events.off("routeChangeComplete", finishLoad);
    router.events.off("routeChangeError", finishLoad);
  };
}, []);

export default function App({ Component, pageProps }) {
  return (
    <>
  {loading && <AppLoader />}
    <SessionProvider session={pageProps.session}>
      <ConnectionStatusProvider>
        <NotificationProvider>
          <NotificationListener />
          <PresenceProvider />
          <Component {...pageProps} />
        </NotificationProvider>
      </ConnectionStatusProvider>
    </SessionProvider>
    </>
  );
}
