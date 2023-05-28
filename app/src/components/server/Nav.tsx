import Link from "next/link";
import NavLinks from "./NavLinks"
import useSocketContext from "@/hooks/useSocketContext";
import { useState } from "react";

const Nav = () => { 
    const { socket } = useSocketContext();
    const [ connected, setConnected ] = useState<string>("not_connected");
    socket?.on("connect", () => setConnected("connected"));
    socket?.on("connect_error", () => setConnected("connection_error"));
    socket?.on("disconnect", () => setConnected("not_connected"));
    return (
        <nav className="w-full h-12 px-10 md:px-20 flex justify-between items-center bg-black">
            <div>
                <ul className="flex items-center list-none">
                    <li>
                        <Link href="/"><p className={`antialiased hover:subpixel-antialiased font-poppins text-white m-2 font-bold`}>Home</p></Link>
                    </li>
                    <li 
                        className={`rounded-full ml-4 px-2 w-fit h-full border-2 
                            ${ connected === "connected" ? "border-green-600 text-green-600" : 
                                connected === "not_connected" ? "border-red-600 text-red-600" :
                                    "border-orange-600 text-orange-600" 
                            }`}
                        >
                        { connected === "connected" ? "Connected" :
                            connected === "not_connected" ? "Disconnected" :
                                "Connection Error" }
                    </li>
                </ul>
            </div>
            <NavLinks />
        </nav>
    );
}

export default Nav;