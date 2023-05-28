import { signIn, signOut, useSession } from "next-auth/react"
import Login from "../svg/LogIn";
import Logout from "../svg/Logout";

const NavAuth = () => {
    const { data: sessionData } = useSession()
    return (
        <li className="h-16 md:h-full">
            <button className="h-full" onClick={ sessionData ? () => void signOut() : () => signIn() }>
                <p className={`nav-link-txt`}>{ sessionData ? "Sign Out" : "Sign In" }</p>
                <div className="group/item relative block h-full centered md:hidden">
                    { sessionData ? <Logout fill="white" className="transition hover:fill-purple-600" /> : <Login fill="white" className="transition hover:fill-purple-600" />}
                    <span className="absolute transition translate-y-[1000%] z-[90] group-hover/item:translate-y-0 bottom-[100%] left-[50%] translate-x-[-50%] centered text-white font-barlow w-20 h-10 bg-black border-yellow-700 border-2 rounded-md">{ sessionData ? "Sign Out" : "Sign In" }</span>
                </div>
            </button>
        </li>
    );
}
export default NavAuth;