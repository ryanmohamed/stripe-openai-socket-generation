import { UserData } from "@/context/RoomContext";
import usePoolCount from "@/hooks/usePoolCount";
import { Key } from "react";
import MemberLink from "../server/MemberLink";

const PoolMembers = () => 
{
    const { poolMembers } = usePoolCount();
    return (
        <div className="shadow-xl shadow-black w-full bg-black hover:cursor-pointer overflow-y-scroll no-scrollbar h-[200px] md:h-full md:w-full rounded-xl overflow-hidden border-2 border-stone-800">
            <div className="flex items-center px-4 w-full h-10 border-b-2 border-stone-800">
                <h1 className="text-xl font-poppins font-semibold text-stone-400">
                    <span> { poolMembers ? poolMembers.length : 0 } Member{poolMembers?.length !== 1 && "s"} in Pool </span> 
                </h1>
            </div>

            <div className="p-4 flex flex-wrap">
                { poolMembers && poolMembers?.map((member: UserData, key: Key) => (
                    <MemberLink key={key} name={member.name} src={member.image} />
                ))}
            </div>
        </div>
    );
}

export default PoolMembers;