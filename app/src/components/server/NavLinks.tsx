import NavLink from "./NavLink";
import NavAuth from "./NavAuth";
import Explore from "../svg/Explore";
import Create from "../svg/Create";
import Join from "../svg/Join";
import Feed from "../svg/Feed";

const Nav = () => { 
    return (
        <div className="absolute md:relative">
            <ul className="md:nav nav-mobile">
                <NavLink href="/explore" svg={<Explore fill="#fafaf9" className="transition shadow-white hover:fill-purple-600" />} text="Explore"></NavLink>
                <NavLink href="/join" svg={<Join fill="#fafaf9" className="transition hover:fill-purple-600" />} text="Join" />
                <NavLink href="/create" svg={<Create fill="#fafaf9" className="transition hover:fill-purple-600" />} text="Create" />
                <NavLink href="/profile" svg={<Feed fill="#fafaf9" className="transition hover:fill-purple-600" />} text="My Profile" />
                <NavAuth />
            </ul>
        </div>
    );
}

export default Nav;