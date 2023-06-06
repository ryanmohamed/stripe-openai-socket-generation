import { FormEvent, useState } from "react";

const JoinRoom = () => {
    const [ error, setError ] = useState<string | null>(null);
    const handleChange = (e: FormEvent) => {
        const { valueAsNumber: value } = e.target as HTMLInputElement;
        const regex: RegExp = /^\d{6}$/;
        if (!String(value).match(regex)) setError("Room ID must be 6 digits.")
        else setError(null);
    }
    return (
        <form 
            onSubmit={() => {}}
            className="flex flex-col w-96 font-barlow text-stone-300"
        >
            <label aria-label="room id form"> Enter 4 digit room id:</label>
            <input 
                type="number" 
                name="room-id" 
                className="text-black"
                onChange={handleChange}
            />
            { error && <span className="text-red-600">{error}</span> }
            <button className="bg-purple-400">Create Room</button>
        </form>
    );
}

export default JoinRoom;