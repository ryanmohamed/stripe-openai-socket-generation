import { useSession } from "next-auth/react";
import Link from "next/link";
import StatusBar from "../client/StatusBar";
import NavLinks from "./NavLinks"
import TokenCount from "../client/TokenCount";

const Nav = () => { 
    const { data: session } = useSession();
    return (
        <nav className="w-full h-12 px-10 md:px-20 flex justify-between items-center bg-black">
            <div>
                <ul className="flex items-center list-none">
                    <li>
                        <Link href="/"><p className={`antialiased hover:subpixel-antialiased font-poppins text-white m-2 font-bold`}>Home</p></Link>
                    </li>
                     <StatusBar />
                </ul>
            </div>
            { session && <TokenCount /> }
            <NavLinks />
        </nav>
    );
}

export default Nav;