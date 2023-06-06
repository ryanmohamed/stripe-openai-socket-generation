import useCreateRoom from "@/hooks/useCreateRoom";
import { MouseEventHandler, useState } from "react";
import { useRouter } from "next/router";

const CreateRoom = () => {
    const router = useRouter();
    const { roomID, createRoom } = useCreateRoom();
    const [ error, setError ] = useState<string | null>(null);
    const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
        event.preventDefault();
        createRoom().then(() => {
            if ( roomID === undefined || roomID === null )
            setError("Error requesting room ID.");
            else {
                setError(null);
            }
        });
    }

    if (!roomID) {
        return (
            <div className="flex flex-col w-48 border-2 border-stone-800 p-4 rounded-md">
                <h1 className="text-center mb-4 text-xl border-b-2 border-stone-500 text-stone-400 font-poppins font-semibold">Create a Room</h1>
                <button onClick={handleSubmit} className="h-12 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors" type="button">Request Room</button>
                { error && <span className="text-red-600 font-barlow mt-2">{error}</span> }
            </div>
        );
    }

    return (
        <div className="flex flex-col w-48 border-2 border-stone-800 p-4 rounded-md">
            <h1 className="text-center mb-4 text-xl border-b-2 border-stone-500 text-stone-400 font-poppins font-semibold">Room {roomID}</h1>
        </div>
    );
    
}

export default CreateRoom;