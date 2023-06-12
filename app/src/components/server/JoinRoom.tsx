import useRoomContext from "@/hooks/useRoomContext";
import { FormEvent, FormEventHandler, useEffect, useRef, useState } from "react";

const JoinRoom = ({ extraStyles }: { extraStyles?: string }) => {
    const { errors, joinRoom } = useRoomContext();
    const ref = useRef<HTMLInputElement | null>(null);
    const [ error, setError ] = useState<string | null | undefined>(null);
    const handleChange = (e: FormEvent) => {
        const { valueAsNumber: value } = e.target as HTMLInputElement;
        const regex: RegExp = /^\d{6}$/;
        if (!String(value).match(regex)) setError("Room ID must be 6 digits.")
        else setError(null);
    }
    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        if (error) return; // only submit if no client side errors
        joinRoom && joinRoom(ref?.current?.value || "000000");
        setError(errors); // retrieve errors from server
    }
    return (
        <form 
            onSubmit={handleSubmit}
            className={`flex-grow px-4 py-10 rounded-md centered flex-col border-2 border-stone-800 ${extraStyles}`}
        >
            <h1 className="w-fit text-center text-2xl mb-4 border-b-2 border-stone-800 text-stone-400 font-poppins font-semibold subpixel-antialiased" aria-label="room id form">Join a Room</h1>
            <div className="flex flex-col mb-6">
                <label htmlFor="room-id" aria-label="join room form" className="text-stone-300 self-start font-barlow text-md mb-2">Enter 6 digit room code.</label>
                <input 
                    ref={ref}
                    type="number" 
                    name="room-id" 
                    placeholder="(ex: 123456)"
                    className="self-center w-full p-2 py-3 rounded-md text-center text-2xl font-poppins font-semibold text-stone-500 bg-stone-900 focus:outline-purple-800 focus:border-none"
                    onChange={handleChange}
                />
                { error && <span className="mt-2 animate-shake font-barlow text-red-600">{error || errors}</span> }
            </div>
            <button disabled={error !== null && error !== undefined} className="self-center h-14 w-1/2 px-2 rounded-md text-lg font-poppins font-semibold text-stone-300 bg-green-800 hover:bg-green-600 transition-colors">Join Room</button>
        </form>
    );
}

export default JoinRoom;