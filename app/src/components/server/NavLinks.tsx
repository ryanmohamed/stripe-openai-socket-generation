import NavLink from "./NavLink";
import NavAuth from "./NavAuth";
import Explore from "../svg/Explore";
import Create from "../svg/Create";
import Join from "../svg/Join";
import Feed from "../svg/Feed";
import { useSession } from "next-auth/react";

// TO DO: RENAME!!

const Nav = () => { 
    const { data: session } = useSession();
    console.log(session);
    return (
        <div className="absolute md:relative">
            <ul className="md:nav nav-mobile">
                <NavLink href="/explore" svg={<Explore fill="#fafaf9" className="transition shadow-white hover:fill-purple-600" />} text="Explore"></NavLink>
                { session && <NavLink href="/rooms" svg={<Join fill="#fafaf9" className="transition hover:fill-purple-600" />} text="Rooms" /> }
                { session && <NavLink href={`/account/${session.user.id}`} svg={<Feed fill="#fafaf9" className="transition hover:fill-purple-600" />} text="My Profile" />}
                <NavAuth />
            </ul>
        </div>
    );
}

export default Nav;