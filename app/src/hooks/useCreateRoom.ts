import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";

type RoomIDType = string;

export default function useCreateRoom() {
    const { socket } = useSocketContext();
    const [ roomID, setRoomID ] = useState<RoomIDType | null>(null);
    const createRoom = async () => {
        socket?.emitWithAck("action:new-room");
    }

    useEffect(() => {
        const handleNewRoom = ({ data }: { data: RoomIDType }) => {
            setRoomID(data);
        };
        if (socket) {
            socket.on("ack:new-room", handleNewRoom);
            return () => {
                socket.off("ack:new-room", handleNewRoom);
            };
        }
    }, [socket]);

    return { roomID, createRoom };
}
