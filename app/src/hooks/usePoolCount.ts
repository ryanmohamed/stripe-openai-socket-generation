import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";
import { UserData, RoomCountUpdate, AckType } from "@/context/SocketContext";

export default function usePoolCount() {
  const { socket } = useSocketContext();
  const [ count, setCount ] = useState<number>(0);
  const [ members, setMembers ] = useState<UserData[] | null | undefined>(null);
  const [ poolMembers, setPoolMembers ] = useState<UserData[] | null | undefined>(null);

  // useEffect(() => {
  //   //this is cached for when socket is defined
  //   socket?.emit("get:room-count", "pool");
  // }, []);

  useEffect(() => {
    const handleConnectionCount = (ack: AckType) => {
      setCount(ack.data?.members?.length || 0);
      ack.data?.roomID === "pool" ? setPoolMembers(ack.data?.members) : setMembers(ack.data?.members);
      console.log("data:", ack)
    };

    if (socket) {
      setCount(0);
      setMembers(null);

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

  return { count, members, poolMembers };
}
