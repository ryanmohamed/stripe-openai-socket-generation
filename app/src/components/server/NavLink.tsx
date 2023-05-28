import Link from "next/link";
import React from "react";
import Explore from "../svg/Explore";
const NavLink = ({href, text, extraStyles, svg}: 
{   
    href: string, 
    text: string,
    extraStyles?: string,
    svg?: React.ReactNode
}) => 
(
    <li>
        <Link href={href}>
            <p className={`nav-link-txt ${extraStyles}`}>{text}</p>
            <div className="group/item relative block md:hidden">
                {svg}
                <span className="absolute transition translate-y-[1000%] z-[90] group-hover/item:translate-y-0 bottom-[150%] left-[50%] translate-x-[-50%] centered text-white font-barlow w-20 h-10 bg-black border-yellow-700 border-2 rounded-md">{text}</span>
            </div>
        </Link>
    </li>
)
export default NavLink;