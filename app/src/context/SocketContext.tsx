import { createContext, useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const publicURL: string = process.env.NODE_ENV === 'production' ? "/" : 'http://localhost:3001/';
const privateURL: string = process.env.NODE_ENV === 'production' ? "/" : 'http://localhost:3001/authenticated';

type AckType = {
    status: "ok" | "error";
    data: ConnectedUserType[] | any;
}

type ConnectedUserType = {
    name: string;
    image: string;
}

// "Types for the client"
interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    "connection-count": (ack: AckType) => void;
}

type ConnectionCount = {
    count: number;
    status: string;
}
  
interface ClientToServerEvents {
    'get:connection-count': (foo: any, users: AckType) => void;
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
    connectionStatus: "connect" | "disconnect" | "error"
    count: number
};

// code meant to be ran on client machine (hence use effect, etc)
export const SocketContext = createContext<SocketContextType>({ 
    socket: null, 
    disconnect: null, 
    connect: null, 
    connectionStatus: "disconnect",
    count: 0
});
export const SocketProvider = ({children}: {
    children?: React.ReactNode;
}) => 
{
    const [ hasConnected, setHasConnected ] = useState<boolean>(false);
    const socketRef = useRef<SocketType | null>(null); // avoid rerender for use in other components
    
    const { data: session } = useSession();
    const [ connectionStatus, setConnectionStatus ] = useState<"connect" | "disconnect" | "error">("disconnect");
    const [ count, setCount ] = useState<number>(0);

    const handleConnect = () => {
        console.log("Handling connection");
        setConnectionStatus("connect");
    };

    const handleDisconnect = (reason: string) => {
        console.log("Disconnect:", reason);
        setConnectionStatus("disconnect");
    };

    const handleError = () => setConnectionStatus("error");

    const handleCountUpdate = (count: number) => {
        console.log("Recieved count", count);
    };

    const addListeners = () => {
        socketRef.current?.on("connect", handleConnect);
        socketRef.current?.on("disconnect", handleDisconnect);
        socketRef.current?.on("connect_error", handleError);
        //socketRef.current?.on("connection-count", handleCountUpdate);  
    }

    const removeListeners = () => {
        socketRef.current?.off("connect", handleConnect);
        socketRef.current?.off("disconnect", handleDisconnect);
        socketRef.current?.off("connect_error", handleError);
        //socketRef.current?.off("connection-count", handleCountUpdate);
    }

    const disconnect = () => {
        removeListeners();
        socketRef.current && socketRef.current.disconnect();
        setHasConnected(false);
        setConnectionStatus("disconnect");
    }

    const connect = () => { 
        let auth = session === null ? null : session;
        let url = session === null ? publicURL : privateURL;
        const options = {
            autoConnect: false,
            withCredentials: true,
            auth: { data: auth }
        };
        socketRef.current = io(url, options) as SocketType;
        socketRef.current?.connect();
        addListeners();
    }
    
    // connect to public socket namespace on mount
    useEffect(() => {
        if (!hasConnected) {
            connect();
        }
        // cleanup
        return () => {
            disconnect();
            setHasConnected(false);
        }
    }, []);

    // reconnect on session updates (i.e: signin, signout, etc)
    useEffect(() => {
        disconnect();
        connect();
        return () => { disconnect(); }
    }, [session]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, disconnect, connect, connectionStatus, count }}>
            {children}
        </SocketContext.Provider>
    );
}