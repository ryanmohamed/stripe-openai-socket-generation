import { MouseEventHandler, Key } from "react";
import { RoomIDType, UserData } from "@/context/RoomContext";
import useRoomContext from "@/hooks/useRoomContext";
import MemberLink from "../server/MemberLink";
import Crown from "../svg/Crown";

import useSocketContext from "@/hooks/useSocketContext";
import Link from "next/link";

const RoomStartup = ({roomID }: { roomID: RoomIDType }) => {
    const { socket } = useSocketContext();
    const { roomData, isAdmin, leaveRoom } = useRoomContext();
    const handleLeave: MouseEventHandler<HTMLButtonElement> = async (event) => {
        event.preventDefault();
        leaveRoom && leaveRoom(roomData?.roomID);
    }
    const handleStart: MouseEventHandler<HTMLButtonElement> = async (event) => {
        event.preventDefault();
        roomData?.roomID && socket?.emit("action:start-match", roomData.roomID);
    }
    return (
        <div className="h-full w-full flex flex-grow justify-between">
            <div className="h-full w-full flex flex-col flex-grow p-4">
                <h1 className="flex justify-between font-poppins font-semibold text-xl text-stone-400 border-b-2 border-stone-800">Room {roomID}
                    { isAdmin && <div className="h-[24px] w-[24px] centered"><Crown className="fill-amber-500"/></div> }
                </h1>
                <div className="h-full flex flex-col justify-between">
                    <div className="my-4 w-full flex md:flex-wrap overflow-scroll no-scrollbar">
                        { roomData?.members && Array.from(roomData?.members).map((member: UserData, key: Key) => (
                            <MemberLink key={key} name={member.name} src={member.image}/>
                        ))}
                    </div>
                    <div className="flex flex-col w-full">
                        {/* todo: make sure the verification of it being >= 2 members happens server side! */}
                        { roomData?.status === "ready" ? <Link href={`/rooms/${roomData?.roomID}`} className="flex-grow h-12 p-2 rounded-md text-lg text-center font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors mb-4">Return to match</Link> : (isAdmin && roomData && roomData?.members?.length > 0) ? <button onClick={handleStart} className="flex-grow h-12 p-2 rounded-md text-center text-lg font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors mb-4" type="button">Start match</button> : null}
                        {/* { (isAdmin && roomData && roomData?.members?.length > 1) && <button onClick={handleStart} className="flex-grow h-12 p-2 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors mb-4" type="button">Start match</button>}
                        { (roomData && roomData.status === "ready") && <button onClick={handleStart} className="flex-grow h-12 p-2 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors mb-4" type="button">Start match</button>} */}
                        <button onClick={handleLeave} className="flex-grow h-12 p-2 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-red-800 hover:bg-red-600 transition-colors" type="button">Leave Room</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomStartup;