import { createContext, useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from 'socket.io-client';
import useSocketContext from "@/hooks/useSocketContext";

type RoomIDType = string | null | undefined;
type UserData = {
    name: string;
    image: string;
}
type RoomDataType = {
    roomID: RoomIDType,
    status: "waiting" | "ready",
    members: UserData[],
    currentQuestion: null, // todo
} | null;

type RoomContextType = { 
    roomID: RoomIDType;
    roomData: RoomDataType;
    createRoom: CallableFunction | null;
    leaveRoom: CallableFunction | null;
};

// code meant to be ran on client machine (hence use effect, etc)
export const RoomContext = createContext<RoomContextType>({ 
    roomID: null,
    roomData: null,
    createRoom: null,
    leaveRoom: null,
});

export const RoomProvider = ({children}: {
    children?: React.ReactNode;
}) => 
{
    const { data: session } = useSession();
    const [ roomID, setRoomID ] = useState<RoomIDType>(null);
    const [ roomData, setRoomData ] = useState<RoomDataType>(null);
    const { socket } = useSocketContext();

    const createRoom = async () => {
        socket?.emitWithAck("action:new-room");
    }

    const leaveRoom = async () => {
        if (roomID) socket?.emitWithAck("action:leave-room", roomID);
    }

    useEffect(() => {
        const handleNewRoom = ({ data }: { data: RoomDataType }) => {
            setRoomID(data?.roomID);
            setRoomData(data);
            console.log(Array.from(data?.members || []))
        };
        const handleLeaveRoom = (ack: any) => {
            if (ack?.status === "ok") setRoomID(null);
        };
        if (socket) {
            socket.on("ack:new-room", handleNewRoom);
            socket.on("ack:left-room", handleLeaveRoom);
            return () => {
                socket.off("ack:new-room", handleNewRoom);
                socket.off("ack:left-room", handleLeaveRoom);
            };
        } 
        else {
            setRoomID(null);
        }
    }, [socket]);

    useEffect(() => {
        socket?.emitWithAck("action:leave-all-rooms");
    }, []);

    return (
        <RoomContext.Provider value={{ roomID, roomData, createRoom: createRoom, leaveRoom: leaveRoom }}>
            {children}
        </RoomContext.Provider>
    );
}