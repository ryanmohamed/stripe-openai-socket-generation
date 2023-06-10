import { createContext, useEffect, useState, useRef, useMemo } from "react";

import useSocketContext from "@/hooks/useSocketContext";
import { AckType } from "./SocketContext";

export type RoomIDType = string | null | undefined;

export type UserData = {
    name: string;
    image: string;
}

export type RoomDataType = {
    roomID: RoomIDType,
    admin: string | null,
    status: "waiting" | "ready",
    members: UserData[] | [],
    currentQuestion: null, // todo
} | null;

export type RoomContextType = { 
    errors: string | null | undefined;
    roomID: RoomIDType;
    roomData: RoomDataType;
    createRoom: CallableFunction | null;
    leaveRoom: CallableFunction | null;
    joinRoom: CallableFunction | null;
};

// code meant to be ran on client machine (hence use effect, etc)
export const RoomContext = createContext<RoomContextType>({ 
    errors: null,
    roomID: null,
    roomData: null,
    createRoom: null,
    leaveRoom: null,
    joinRoom: null
});

export const RoomProvider = ({children}: {
    children?: React.ReactNode;
}) => 
{
    const [ roomID, setRoomID ] = useState<RoomIDType>(null);
    const [ roomData, setRoomData ] = useState<RoomDataType>(null);
    const [ errors, setErrors ] = useState<string | null | undefined>(null);
    const { socket } = useSocketContext();

    const createRoom = async () => {
        socket?.emitWithAck("action:new-room");
    }

    const leaveRoom = async () => {
        if (roomID) socket?.emitWithAck("action:leave-room", roomID);
    }

    const joinRoom = async (room: string) => { socket?.emit("action:join-room", room); }

    const resetRoomContext = () => {
        setRoomID(null);
        setRoomData(null);
    }

    useEffect(() => {
        resetRoomContext(); // on socket change

        const handleErrors = (ack: AckType) => {
            if (!ack || ack?.status === "error") {
                setErrors(ack?.errorMessage);
            }
        }

        const handleLeaveRoom = (ack: any) => {
            if (ack?.status === "ok") setRoomID(null);
            handleErrors(ack);
        };

        // entering a room on create or join will explicitly set the user's room
        const handleEnterLeaveRoom = (ack: AckType) => {
            const { data, status } = ack;
            if (status.toLowerCase() === "ok") {
                data?.roomID !== "pool" && setRoomID(data?.roomID);
                data?.roomID !== "pool" && setRoomData(data);
            }
            handleErrors(ack);
        };

        // update room count only updates member count, so don't change 
        const handleRoomUpdate = (ack: AckType) => {
            const { data } = ack;
            data?.roomID !== "pool" && setRoomData(data);
            handleErrors(ack);
        };

        if (socket) {
            socket.on("ack:new-room", handleEnterLeaveRoom); // mutates room data and room id
            socket.on("ack:join-room", handleEnterLeaveRoom); // mutates room data and room id
            socket.on("ack:left-room", handleEnterLeaveRoom); // mutates room data and room id
            socket.on("update:room-count", handleRoomUpdate); // mutates room data
            return () => {
                socket.off("ack:new-room", handleEnterLeaveRoom);
                socket.off("ack:left-room", handleEnterLeaveRoom);
                socket.off("ack:join-room", handleEnterLeaveRoom);
                socket.off("update:room-count", handleRoomUpdate);
            };
        } 
    }, [socket]);

    useEffect(() => {
        socket?.emitWithAck("action:leave-all-rooms");
    }, []);

    return (
        <RoomContext.Provider value={{ errors, roomID, roomData, createRoom: createRoom, leaveRoom: leaveRoom, joinRoom: joinRoom }}>
            {children}
        </RoomContext.Provider>
    );
}