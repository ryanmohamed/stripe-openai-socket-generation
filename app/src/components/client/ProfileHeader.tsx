import { useSession } from "next-auth/react";

const ProfileHeader = ({ user }: any) => {
    return (
        <header className="p-6 md:py-12 border-b-2 border-stone-950">
            <div className="flex">
                <img 
                    className="self-center w-24 md:w-36 h-24 md:h-36 rounded-full"
                    src={user?.image || "http://placeholder.co/500/500"} 
                    alt="profile picture" 
                />
                <div className="pl-8 font-barlow text-stone-300">
                    <h1 className="mb-4 md:mb-6 text-3xl md:text-5xl font-bold">{user?.name} 🐝</h1>
                    <div className="group p-4 pr-24 rounded-sm cursor-pointer transition border-[1px] border-[#00000000] hover:border-stone-900 ">
                        <p className="text-stone-400 text-base md:text-lg">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum aperiam nihil in tempora provident molestiae nisi dolorem sint consequatur veritatis, inventore cupiditate tempore excepturi nostrum molestias temporibus voluptatem eos maiores.</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default ProfileHeader;