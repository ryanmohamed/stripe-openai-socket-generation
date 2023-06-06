import { MouseEventHandler, useState } from "react";
import { useRouter } from "next/router";
import useRoomContext from "@/hooks/useRoomContext";

const CreateRoom = () => {
    const router = useRouter();
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
            <div className="flex flex-col w-48 border-2 border-stone-800 p-4 rounded-md">
                <h1 className="text-center mb-4 text-xl border-b-2 border-stone-500 text-stone-400 font-poppins font-semibold">Create a Room</h1>
                <button onClick={handleCreate} className="h-12 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors" type="button">Request Room</button>
                { error && <span className="text-red-600 font-barlow mt-2">{error}</span> }
            </div>
        );
    }

    return (
        <div className="flex flex-col w-48 border-2 border-stone-800 p-4 rounded-md">
            <h1 className="text-center mb-4 text-xl border-b-2 border-stone-500 text-stone-400 font-poppins font-semibold">Room {roomID}</h1>
            { roomData && Array.from(roomData.members).map((member: any, key: any) => (
                <p className="text-white" key={key}>{member.name}</p>
            ))}
            <button onClick={handleLeave} className="h-12 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-red-800 hover:bg-red-600 transition-colors" type="button">Leave Room</button>
        </div>
    );
    
}

export default CreateRoom;