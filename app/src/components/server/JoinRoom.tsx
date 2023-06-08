import useRoomContext from "@/hooks/useRoomContext";
import { FormEvent, FormEventHandler, useRef, useState } from "react";

const JoinRoom = ({ extraStyles }: { extraStyles?: string }) => {
    const { joinRoom } = useRoomContext();
    const ref = useRef<HTMLInputElement | null>(null);
    const [ error, setError ] = useState<string | null>(null);
    const handleChange = (e: FormEvent) => {
        const { valueAsNumber: value } = e.target as HTMLInputElement;
        const regex: RegExp = /^\d{6}$/;
        if (!String(value).match(regex)) setError("Room ID must be 6 digits.")
        else setError(null);
    }
    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        if (error === null || error === undefined){
            joinRoom && joinRoom(ref?.current?.value || "000000");
        }
    }
    return (
        <form 
            onSubmit={handleSubmit}
            className={`flex-grow p-4 rounded-md mb-10 flex flex-col border-2 border-stone-800 ${extraStyles}`}
        >
            <h1 className="mb-6 text-xl font-semibold font-poppins text-stone-400 border-b-2 border-stone-800" aria-label="room id form"> Enter 4 digit room id:</h1>
            <div className="flex flex-col mb-6">
                <input 
                    ref={ref}
                    type="number" 
                    name="room-id" 
                    placeholder="(ex: 123456)"
                    className="w-full p-2 py-3 rounded-md text-center text-2xl font-poppins font-semibold text-stone-500 bg-black focus:outline-purple-800 focus:border-none"
                    onChange={handleChange}
                />
                { error && <span className="mt-2 animate-shake font-barlow text-red-600">{error}</span> }
            </div>
            <button className="rounded-md h-12 transition font-poppins font-semibold text-lg text-stone-300 bg-green-800 hover:bg-green-600">Join Room</button>
        </form>
    );
}

export default JoinRoom;