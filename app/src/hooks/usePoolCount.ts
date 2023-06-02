import { useEffect, useState } from "react";
import useSocketContext from "./useSocketContext";

type CountType = number

export default function usePoolCount() {
  const { socket } = useSocketContext();
  const [ count, setCount ] = useState<number>(0);

  useEffect(() => {
    const handleConnectionCount = ({ data }: { data: CountType}) => {
      setCount(data);
    };

    if (socket) {
      // handle updates
      socket.on("pool-count", handleConnectionCount);

      // ask for count, will be cached and emitted once the socket reconnects
      const getPoolCount = async () => await socket.emitWithAck("get:pool-count", () => {});
      getPoolCount();

      // clean up
      return () => {
        socket.off("pool-count", handleConnectionCount);
      };
    }

  }, [socket]);

  return { count };
}
