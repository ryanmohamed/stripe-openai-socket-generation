import useRoomContext from "@/hooks/useRoomContext";
import JoinRoom from "./JoinRoom";
import CreateRoom from "../client/CreateRoom";
import RoomStartup from "../client/RoomStartup";

const ConnectOptions = () => (
    <div className="flex flex-wrap flex-col md:flex-row flex-grow justify-between">
        <CreateRoom extraStyles="md:w-1/2 p-4 border-none"/>
        <JoinRoom extraStyles="text-center md:w-1/2 rounded-none border-[0] border-t-2 md:border-t-[0] md:border-l-2 border-stone-800"/>  
    </div>
)

const RoomPanel = () => {
    const { roomID } = useRoomContext();
    return (
        <div className="shadow-xl shadow-black flex w-full h-full rounded-xl border-2 border-stone-800 bg-gradient-to-b from-stone-950 to-black">
            { roomID ? <RoomStartup roomID={ roomID } /> : <ConnectOptions />}
        </div>
    );
}

export default RoomPanel;