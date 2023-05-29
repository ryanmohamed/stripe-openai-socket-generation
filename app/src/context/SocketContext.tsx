import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL: string = process.env.NODE_ENV === 'production' ? "/" : 'http://localhost:3001';

// "Types for the client"
interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

type ConnectionCount = {
    count: number;
    status: string;
}
  
interface ClientToServerEvents {
    'get:connection-count': (connectionCountResponse: any, foo: any) => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;
type SocketContextType = { 
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null, 
    disconnect: null | CallableFunction  
    connect: null | CallableFunction
};

// code meant to be ran on client machine (hence use effect, etc)
export const SocketContext = createContext<SocketContextType>({ socket: null, disconnect: null, connect: null });
export const SocketProvider = ({children}: {
    children?: React.ReactNode;
}) => 
{
    const [ hasConnected, setHasConnected ] = useState<boolean>(false);
    const [ socket, setSocket ] = useState<SocketType | null>(null);
    const { data: session } = useSession();

    const disconnect = () => {
        socket?.disconnect();
        setSocket(null);
        setHasConnected(false);
    }

    const connect = () => { 
        if(session?.user){
            setSocket(io(URL, {
                autoConnect: true,
                withCredentials: true,
                auth: { data: session }
            }) as Socket<ServerToClientEvents, ClientToServerEvents>);
            setHasConnected(true);
        }
    }
    
    useEffect(() => {
        const user = session?.user
        // if no connection and signed in - establish socket
        if(!hasConnected){
            connect();
        }
        // if socket exists but no user - disconnect
        else if (!user && socket) {
            disconnect();
        }
        // cleanup 
        return () => {
            if (socket) disconnect();
        };
    }, [session]);

    return (
        <SocketContext.Provider value={{ socket, disconnect, connect }}>
            {children}
        </SocketContext.Provider>
    );
}