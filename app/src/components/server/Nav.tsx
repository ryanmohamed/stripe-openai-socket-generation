import Link from "next/link";

const NavLink = ({href, text, extraStyles}: 
{   
    href: string, 
    text: string,
    extraStyles?: string
}) => 
(
    <li>
        <Link href={href}><p className={`antialiased hover:subpixel-antialiased font-poppins font-normal text-white m-2 ${extraStyles}`}>{text}</p></Link>
    </li>
)

const Nav = () => { 
    return (
        <nav className="w-full h-12 px-2 flex justify-between items-center bg-black">
            <div>
                <ul className="list-none"><NavLink href="/" text="Home" extraStyles="font-bold" /></ul>
            </div>
            <ul className="h-full centered list-none">
                <NavLink href="/explore" text="Explore" />
                <NavLink href="/join" text="Join" />
                <NavLink href="/create" text="Create" />
                <NavLink href="/feed" text="My Feed" />
            </ul>
        </nav>
    );
}

export default Nav;