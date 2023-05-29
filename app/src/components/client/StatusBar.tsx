"use client";
import useSocketContext from "@/hooks/useSocketContext";
import { useState } from "react";
import Refresh from "@/components/svg/Refresh";

const StatusBar = () => {
    const { socket, disconnect, connect } = useSocketContext();
    const [ color, setColor ] = useState<string>("border-red-600 text-red-600");
    const [ status, setStatus ] = useState<string>("Disconnected");
    socket?.on("connect", () => {
        setColor("border-green-600 text-green-600 fill-green-600");
        setStatus("Connected");
    });
    socket?.on("connect_error", () => {
        setColor("border-orange-600 text-orange-600");
        setStatus("Conection Error");
    });
    socket?.on("disconnect", () => {
        setColor("border-red-600 text-red-600");
        setStatus("Disconnected");
    });
    return (
        <li className={`${color} rounded-full ml-4 px-2 w-fit h-full border-2 flex`}>
            <span>{status}</span>
            { status !== "Connected" && <button className="w-6 ml-2 inline-flex flex-grow items-center justify-center"
                    onClick={() => {
                        disconnect && disconnect();
                        connect && connect();
                    }}
                >
                    <Refresh fill={`${status === "Connected" ? "green" : status === "Disconnected" ? "red" : "orange"}`} />
                </button>
            }
        </li>
    );
}

export default StatusBar;