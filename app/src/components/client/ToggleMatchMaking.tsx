import { useEffect, useState } from "react";
import useSocketContext from "@/hooks/useSocketContext";
import useRoomContext from "@/hooks/useRoomContext";

const ToggleMatchMaking = () => {
    const [ toggle, setToggle ] = useState<boolean>(false);
    const { socket, connectionStatus } = useSocketContext();
    const { roomData, joinRoom, leaveRoom } = useRoomContext();
    const handleToggle = () => {
        if (!toggle) {
            leaveRoom && leaveRoom(roomData?.roomID); // updates client side state mainly
            joinRoom && joinRoom("pool");
            setToggle(true);
        }
        else {
            leaveRoom && leaveRoom("pool");
            setToggle(false);
        }
    }
    useEffect(() => {
        roomData && setToggle(false);
    }, [roomData]);
    useEffect(() => {
        if(connectionStatus === "disconnect" || connectionStatus === "error") {
            setToggle(false);
            leaveRoom && leaveRoom("pool"); //cached
        }
    }, [connectionStatus]);
    return (
        <div className="shadow-xl shadow-black p-8 py-10 flex flex-col justify-between w-full h-full bg-gradient-to-r from-stone-950 to-black rounded-md border-2 border-stone-800">
            <h1 className="font-poppins font-semibold text-4xl text-stone-300 subpixel-antialiased border-b-2 border-stone-800 w-fit">Matchmacking</h1>
            <div>
            <p className="mt-4 text-xl font-barlow subpixel-antialiased text-stone-400">Randomly connect with members in the pool?</p>
            <div className="mt-4 focus:outline-none group hover:cursor-pointer flex items-center px-2 h-14 w-36 rounded-full bg-gradient-to-l from-green-600 to-emerald-950 shadow-inner shadow-black border-2 border-emerald-950" onClick={handleToggle}>
                <button className={`${toggle ? "bg-stone-200" : "bg-stone-400"} h-10 w-10 rounded-full shadow-lg shadow-black transition-all group-hover:shadow-stone-950 group-hover:bg-stone-200 ${toggle ? "ml-20" : ""}`} onClick={handleToggle}></button>
            </div>
            </div>
        </div>
    );
}

export default ToggleMatchMaking;