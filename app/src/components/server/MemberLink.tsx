const MemberLink = ({src, name, className, ...props}: 
{
    src: string | null | undefined,
    name: string | null | undefined
    className?: string
}) => 
{
    return (
        <div className={`mr-2 w-fit py-1 pl-3 pr-6 my-2 rounded-full flex items-center text-white font-barlow bg-stone-950 border-2 border-stone-800 ${className}`}>
            <img 
                className="opacity-80 h-4 w-4 rounded-full p-[2px] border-2 border-green-400 select-none"
                src={src || "http://placeholder.co/500/500"}
                alt="user image" 
            />
            <span className="text-sm md:text-md ml-4 whitespace-nowrap subpixel-antialiased"> {name || "Anonymous"} </span>
        </div>
    );
}

export default MemberLink;