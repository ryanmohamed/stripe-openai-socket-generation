"use client";
import useSocketContext from "@/hooks/useSocketContext";
import { useEffect, useState } from "react";
import Refresh from "@/components/svg/Refresh";
import useConnectionStatus from "@/hooks/useConnectionStatus";

const StatusBar = () => {
    const { socket, disconnect, connect, connectionStatus } = useSocketContext();
    const [ color, setColor ] = useState<string>("border-red-600 text-red-600");
    const [ message, setMessage ] = useState<string>("Disconnected");

    useEffect(() => {
        if (connectionStatus === "error") {
            setColor("border-orange-600 text-orange-600");
            setMessage("Connection Error");
        }
        else if (connectionStatus === "disconnect") {
            setColor("border-red-600 text-red-600");
            setMessage("Disconnected");
        }
        else {
            setColor("border-green-600 text-green-600 fill-green-600");
            setMessage("Connected");
        }
    }, [connectionStatus]);

    return (
        <li className={`${color} rounded-full ml-4 px-2 w-fit h-full border-2 flex`}>
            <span>{message}</span>
            { connectionStatus !== "connect" && <button className="w-6 ml-2 inline-flex flex-grow items-center justify-center"
                    onClick={() => {
                        disconnect && disconnect();
                        connect && connect();
                    }}
                >
                    <Refresh fill={`${ connectionStatus === "disconnect" ? "red" : "orange"}`} />
                </button>
            }
        </li>
    );
}

export default StatusBar;