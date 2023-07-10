import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "@/utils/api";

import NavLayout from "@/components/NavLayout"
import "@/styles/globals.css";
import { SocketProvider } from "@/context/SocketContext"
import { RoomProvider } from "@/context/RoomContext";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
    <SocketProvider>
        <NavLayout>
          <RoomProvider>
            <Component {...pageProps} />
            <ToastContainer />
          </RoomProvider>
        </NavLayout>
    </SocketProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
