import { MouseEventHandler, useState, Key } from "react";
import { useRouter } from "next/router";
import useRoomContext from "@/hooks/useRoomContext";
import MemberLink from "../server/MemberLink";
import { UserData } from "@/context/RoomContext";

const CreateRoom = ({ extraStyles }: { extraStyles?: string }) => {
    const { roomID, roomData, createRoom, leaveRoom } = useRoomContext();
    const [ error, setError ] = useState<string | null>(null);
    
    const handleCreate: MouseEventHandler<HTMLButtonElement> = async (event) => {
        event.preventDefault();
        createRoom && createRoom();
    }

    const handleLeave: MouseEventHandler<HTMLButtonElement> = async (event) => {
        event.preventDefault();
        leaveRoom && leaveRoom();
    }

    if (!roomID) {
        return (
            <div className={`flex-grow flex flex-col px-4 py-10 justify-center items-center ${extraStyles}`}>
                <h1 className="text-center text-2xl mb-4 border-b-2 border-stone-800 text-stone-400 font-poppins font-semibold subpixel-antialiased">Create a Room</h1>
                <button onClick={handleCreate} className="h-14 w-1/2 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors" type="button">Request Room</button>
                { error && <span className="text-red-600 font-barlow mt-2">{error}</span> }
            </div>
        );
    }

    return (
        <div className={`flex-grow flex flex-col w-48 border-2 border-stone-800 p-4 rounded-md ${extraStyles}`}>
            <h1 className="text-center mb-4 text-3xl border-b-2 border-stone-800 text-stone-400 font-poppins font-semibold">Room {roomID}</h1>
            <div className="mb-4">
                { roomData && Array.from(roomData.members).map((member: UserData, key: Key) => (
                    <MemberLink key={key} name={member.name} src={member.image}/>
                ))}
            </div>
            <button onClick={handleLeave} className="h-14 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-red-800 hover:bg-red-600 transition-colors" type="button">Leave Room</button>
        </div>
    );
    
}

export default CreateRoom;