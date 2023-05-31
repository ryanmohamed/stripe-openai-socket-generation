import { resolve } from "path";
import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";

type ConnectedUserType = {
  name: string;
  image: string;
}

export default function useConnectionCount() {
  const { socket } = useSocketContext();
  const [ count, setCount ] = useState<number>(0);
  const [ users, setUsers ] = useState<ConnectedUserType[] | null>(null);

  useEffect(() => {

    const handleConnectionCount = ({ data }: { data: ConnectedUserType[]}) => {
      console.log(data)
      setCount(data?.length || 0);
      setUsers(data);
    };

    if (socket) {
      // handle updates
      socket.on("connection-count", handleConnectionCount);

      // ask for count, will be cached and emitted once the socket reconnects
      socket.emitWithAck("get:connection-count", (users: ConnectedUserType[]) => {})
      .then((users) => {
          console.log("ack:", users);
          setCount(users.length || 0);
          setUsers(users);
      });

      // clean up
      return () => {
        socket.off("connection-count", handleConnectionCount);
      };
    }

  }, [socket]);

  return { count, users };
}
