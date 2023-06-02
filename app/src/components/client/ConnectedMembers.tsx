import usePoolCount from "@/hooks/usePoolCount";

const ConnectedMembers = () => 
{
    const { count } = usePoolCount();
    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-stone-950 bg-black">
            <div className="flex items-center px-4 w-full h-10 bg-stone-950">
                <h1 className="text-xl font-poppins text-stone-400 subpixel-antialiased">
                    { count && <span> {count.toString()+" "} </span> } 
                    Members in Pool
                </h1>
            </div>
        </div>
    );
}

export default ConnectedMembers;