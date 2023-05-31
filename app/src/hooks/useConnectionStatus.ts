import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";

export default function useConnectionStatus () {
    const { socket } = useSocketContext();
    const [ mounted, setMounted ] = useState<boolean>(false);
    const [ status, setStatus ] = useState<"connect" | "disconnect" | "error">("disconnect");
    useEffect(() => {
        if (!mounted) {
            if (socket) {
                socket.on("connect", () => setStatus("connect"));
                socket.on("disconnect", () => setStatus("disconnect"));
                socket.on("connect_error", () => setStatus("error"));
                setMounted(true);
            } 
            else {
                setMounted(false);
            }
        }
    }, [socket]);

    useEffect(() => {
        return () => {
            socket?.off("connect", () => setStatus("connect"));
            socket?.off("disconnect", () => setStatus("disconnect"));
            socket?.off("connect_error", () => setStatus("error"));
            setMounted(false);
        }
    }, []);

    return { status };
};