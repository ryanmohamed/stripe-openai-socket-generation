import { MouseEventHandler, Key } from "react";
import { UserData } from "@/context/SocketContext";
import { RoomIDType } from "@/context/RoomContext";
import useRoomContext from "@/hooks/useRoomContext";
import JoinRoom from "./JoinRoom";
import CreateRoom from "../client/CreateRoom";
import MemberLink from "./MemberLink";

const ConnectOptions = () => (
    <div className="flex flex-row-reverse flex-grow justify-between">
        <JoinRoom extraStyles="text-center h-full w-1/2 rounded-none border-[0] border-l-2 border-stone-800"/>
        <CreateRoom extraStyles="h-full w-1/2 border-none"/>
    </div>
)

const RoomInformation = ({roomID }: { roomID: RoomIDType }) => {
    const { roomData, leaveRoom } = useRoomContext();
    const handleLeave: MouseEventHandler<HTMLButtonElement> = async (event) => {
        event.preventDefault();
        leaveRoom && leaveRoom();
    }
    return (
        <div className="flex flex-grow justify-between">
            <div className="h-full flex flex-col flex-grow p-4">
                <h1 className="font-poppins font-semibold text-xl text-stone-400 border-b-2 border-stone-800">Room {roomID}</h1>
                <div className="h-full flex flex-col justify-between">
                    <div className="my-4 flex flex-wrap">
                        { roomData && Array.from(roomData.members).map((member: UserData, key: Key) => (
                            <MemberLink key={key} name={member.name} src={member.image}/>
                        ))}
                    </div>
                    <button onClick={handleLeave} className="h-12 p-2 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-red-800 hover:bg-red-600 transition-colors" type="button">Leave Room</button>
                </div>
            </div>
        </div>
    );
}

const RoomPanel = () => {
    const { roomID } = useRoomContext();
    return (
        <div className="flex w-full mb-10 rounded-md border-2 border-stone-800">
            { roomID ? <RoomInformation roomID={ roomID } /> : <ConnectOptions />}
        </div>
    );
}

export default RoomPanel;