import Link from "next/link";
import NavLinks from "./NavLinks"
import useSocketContext from "@/hooks/useSocketContext";
import { useState } from "react";

const Nav = () => { 
    const { socket } = useSocketContext();
    const [ connected, setConnected ] = useState<boolean>(false);
    socket?.on("connect", () => setConnected(true));
    socket?.on("disconnect", () => setConnected(false));
    return (
        <nav className="w-full h-12 px-10 md:px-20 flex justify-between items-center bg-black">
            <div>
                <ul className="flex items-center list-none">
                    <li>
                        <Link href="/"><p className={`antialiased hover:subpixel-antialiased font-poppins text-white m-2 font-bold`}>Home</p></Link>
                    </li>
                    <li className={`rounded-full ml-4 px-2 w-fit h-full border-2 ${connected ? "border-green-600 text-green-600" : "border-red-600 text-red-600"}`}>
                        { connected ? "Connected" : "Disconnected" }
                    </li>
                </ul>
            </div>
            <NavLinks />
        </nav>
    );
}

export default Nav;