import { createContext, useEffect, useState, useRef, useMemo } from "react";

import useSocketContext from "@/hooks/useSocketContext";
import { AckType } from "./SocketContext";
import { useRouter } from "next/router";

export type RoomIDType = string | null | undefined;

export type UserData = {
    id?: string | null | undefined;
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
    isAdmin: boolean | null | undefined;
    createRoom: CallableFunction | null;
    leaveRoom: CallableFunction | null;
    joinRoom: CallableFunction | null;
};

// code meant to be ran on client machine (hence use effect, etc)
export const RoomContext = createContext<RoomContextType>({ 
    errors: null,
    roomID: null,
    roomData: null,
    isAdmin: null,
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
    const [ isAdmin, setIsAdmin ] = useState<boolean | null | undefined>(null);
    const { socket, connectionStatus } = useSocketContext();
    const router = useRouter();

    const createRoom = async () => {
        socket?.emitWithAck("action:new-room");
    }

    const leaveRoom = async (room: string | null = null) => {
        if (room) socket?.emit("action:leave-room", room);
        if (roomID) socket?.emit("action:leave-room", roomID);
    }

    const joinRoom = async (room: string) => { socket?.emit("action:join-room", room); }

    const resetRoomContext = () => {
        setRoomID(null);
        setRoomData(null);
        setIsAdmin(null);
    }

    const handleMatchStart = async (ack: AckType) => {
        if (ack.status === "ok") {
            await router.push(`/rooms/${ack.data?.roomID}`);
            setRoomData(ack?.data);
        }
    }

    useEffect(() => {
        resetRoomContext(); // on socket change

        const handleErrors = (ack: AckType) => {
            if (!ack || ack?.status === "error") {
                setErrors(ack?.errorMessage);
            }
        }

        // entering a room on create or join will explicitly set the user's room
        const handleEnterRoom = (ack: AckType) => {
            const { data, status } = ack;
            if (status.toLowerCase() === "ok") {
                data?.roomID !== "pool" && setRoomID(data?.roomID);
                data?.roomID !== "pool" && setRoomData(data);
            }
            handleErrors(ack);
        };

        const handleLeaveRoom =(ack: AckType) =>  {
            const { data, status } = ack;
            if (status.toLowerCase() === "ok") {
                data?.roomID !== "pool" && setRoomID(null);
                data?.roomID !== "pool" && setRoomData(null);
            }
        }

        // update room count only updates member count, so don't change 
        const handleRoomUpdate = (ack: AckType) => {
            const { data } = ack;
            data?.roomID !== "pool" && setRoomData(data);
            handleErrors(ack);
        };

        if (socket) {
            socket.on("ack:new-room", handleEnterRoom); // mutates room data and room id
            socket.on("ack:join-room", handleEnterRoom); // mutates room data and room id
            socket.on("ack:left-room", handleLeaveRoom); // mutates room data and room id
            socket.on("update:room-count", handleRoomUpdate); // mutates room data
            socket.on("ack:start-match", handleMatchStart); // mutates room data
            return () => {
                socket.off("ack:new-room", handleEnterRoom);
                socket.off("ack:left-room", handleLeaveRoom);
                socket.off("ack:join-room", handleEnterRoom);
                socket.off("update:room-count", handleRoomUpdate);
                socket.off("ack:start-match", handleMatchStart); // mutates room data
            };
        } 
    }, [socket]);

    useEffect(() => {
        socket?.emitWithAck("action:leave-all-rooms");
    }, []);

    // handle socket disconnections 
    useEffect(() => {
        if(connectionStatus === "disconnect" || connectionStatus === "error") {
            resetRoomContext();
        }
    }, [connectionStatus]);

    useEffect(() => {
        
        (roomData && roomData.admin === socket?.id) ? setIsAdmin(true) : setIsAdmin(false);
    }, [roomData])

    return (
        <RoomContext.Provider value={{ errors, roomID, roomData, isAdmin, createRoom: createRoom, leaveRoom: leaveRoom, joinRoom: joinRoom }}>
            {children}
        </RoomContext.Provider>
    );
}