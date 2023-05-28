import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "@/utils/api";

import NavLayout from "@/components/NavLayout"
import "@/styles/globals.css";
import { SocketProvider } from "@/context/SocketContext"

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
    <SocketProvider>
        <NavLayout>
            <Component {...pageProps} />
        </NavLayout>
    </SocketProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
