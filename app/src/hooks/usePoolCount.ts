import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";
import { UserData, RoomCountUpdate, AckType } from "@/context/SocketContext";

export default function usePoolCount() {
  const { socket } = useSocketContext();
  const [ poolMembers, setPoolMembers ] = useState<UserData[] | null | undefined>(null);

  useEffect(() => {
    const handleConnectionCount = (ack: AckType) => {
      ack.data?.roomID === "pool" && setPoolMembers(ack.data?.members);
    };

    if (socket) {
      setPoolMembers(null);

      // handle updates
      socket.on("ack:room-count", handleConnectionCount);
      socket.on("update:room-count", handleConnectionCount);

      // ask for count
      socket.emit("get:room-count", "pool");

      // clean up
      return () => {
        socket.off("ack:room-count", handleConnectionCount);
        socket.off("update:room-count", handleConnectionCount);
      };
    }

  }, [socket]);

  return { poolMembers };
}
