import { useContext } from "react";
import { SocketContext } from "@/context/SocketContext";

export default function useSocketContext () {
    return useContext(SocketContext);
};