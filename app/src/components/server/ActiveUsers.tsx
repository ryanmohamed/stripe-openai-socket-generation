const Contributor = ({src, name, ...props}: 
    {
        src: string,
        name: string
    }) => 
    {
        return (
            <div className="mr-2 w-fit py-1 pl-3 pr-6 my-2 rounded-full flex items-center text-white font-barlow bg-stone-950 border-2 border-stone-800">
                <img 
                    className="opacity-80 h-4 w-4 rounded-full p-[2px] border-2 border-green-400 select-none"
                    src={src}
                    alt="user image" 
                />
                <span className="text-sm md:text-md ml-4 whitespace-nowrap subpixel-antialiased"> {name} </span>
            </div>
        );
    }

const ActiveUsers = ({ users, children }: 
{
    users: any[];
    children?: React.ReactNode
}) => 
{ 
    return (
        <div className="w-fit min-h-20 rounded-3xl p-3 border-2 border-stone-900 bg-zinc-950">
            <p className="text-green-700 mb-1 text-lg font-barlow pb-2 border-b-2 border-stone-900">
                <span className="text-green-500 glow-lg text-2xl mx-2">{users.length}</span> Active User{users.length>1&&"s"}
            </p>
            <div className="flex flex-wrap items-center">
                { users && users.slice(0,4).map((user, key) => (
                    <Contributor src={user.img_url} name={user.display_name} key={key} />
                )) }
                <div className="mr-2 w-fit py-1 pl-3 pr-6 my-2 rounded-full flex items-center text-white font-barlow bg-stone-950 border-2 border-stone-800">
                <span className="text-sm md:text-md ml-4 whitespace-nowrap subpixel-antialiased"> ... </span>
                </div>
            </div>
        </div>
    );
}

export default ActiveUsers;