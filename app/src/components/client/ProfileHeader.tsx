import { useSession } from "next-auth/react";

const ProfileHeader = ({ user }: any) => {
    return (
        <header className="p-6 md:p-10 border-b-2 border-stone-950">
            <div className="flex">
                <img 
                    className="w-24 md:w-36 h-24 md:h-36 rounded-full"
                    src={user?.image || "http://placeholder.co/500/500"} 
                    alt="profile picture" 
                />
                <h1 className="ml-8 text-3xl md:text-5xl font-bold font-barlow text-stone-300">{user?.name}</h1>
            </div>
        </header>
    );
}

export default ProfileHeader;