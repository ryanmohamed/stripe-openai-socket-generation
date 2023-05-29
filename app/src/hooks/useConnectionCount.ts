import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";
export default function useConnectionCount () {
    const { socket } = useSocketContext();
    const [ count, setCount ] = useState<number>(0);
    const [ registered, setRegistered ] = useState<boolean>(false);
    useEffect(() => {
        if (socket) {
            socket.emit("get:connection-count", {}, (response: any) => {
                setCount(response.count);
            });
        } 
        return () => {
            setRegistered(false);
        }
    }, []);
    useEffect(() => {
        if (!socket) setRegistered(false);
        if (!registered) {
            if (socket) {
                socket.on("connection-count" as any, (c: number) => {
                    setCount(c);
                })
                setRegistered(true);
            }
        }
    }, [socket]);
    return { count };
};