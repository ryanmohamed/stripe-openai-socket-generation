import { resolve } from "path";
import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";

export default function useConnectionCount() {
  const { socket } = useSocketContext();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {

    const handleConnectionCount = (response: any) => {
      setCount(response.count as number);
    };

    if (socket) {
      // handle updates
      socket.on("connection-count", handleConnectionCount);

      // ask for count, will be cached and emitted once the socket reconnects
      socket.emitWithAck("get:connection-count", (response: any) => {})
      .then((response) => {
          console.log("ack:", response);
          setCount(response.count as number);
      });

      // clean up
      return () => {
        socket.off("connection-count", handleConnectionCount);
      };
    }

  }, [socket]);

  return { count };
}
