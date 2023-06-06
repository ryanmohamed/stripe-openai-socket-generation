import { useContext } from "react";
import { RoomContext } from "@/context/RoomContext";

export default function useRoomContext () {
    return useContext(RoomContext);
};