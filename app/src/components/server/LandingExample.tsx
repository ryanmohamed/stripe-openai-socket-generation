import Image from "next/image";
import img from "../../../public/demo.png"

const Contributor = ({src, name}: 
{
    src: string,
    name: string
}) => 
{
    return (
        <div className="w-fit py-1 pl-3 pr-6 my-2 rounded-full flex items-center text-white font-barlow bg-stone-950 border-2 border-stone-800">
            <img 
                className="opacity-80 h-4 w-4 rounded-full p-[2px] border-2 border-green-400 select-none"
                src={src}
                alt="user image" 
            />
            <span className="text-sm md:text-md ml-4 whitespace-nowrap subpixel-antialiased"> {name} </span>
        </div>
    );
}

const LandingExample = () => {
    return (
        <div className="w-fit rounded-lg drop-shadow-[0_-20px_60px_rgba(140,128,253,0.15)]">

            <div className="h-[325px] md:h-[394px] w-[379px] md:w-[451px]">
                <div className="relative h-[220px] md:h-[300px] w-[220px] md:w-[300px]">
                    <Image className="rounded-lg select-none h-[220px] md:h-[300px] w-auto" src={img} alt="a demo image" />
                    <div className="bg-zinc-950 py-2 md:p-3 px-3 rounded-xl absolute top-[70%] left-[90%] border-[1px] border-stone-700">
                        <h3 className="text-stone-100 text-md md:text-lg font-barlow border-stone-700 border-b-2 mb-2 subpixel-antialiased">Contributors</h3>
                        <Contributor src="https://picsum.photos/100" name="Ryan Mohamed" />
                        <Contributor src="https://picsum.photos/100" name="Anjuli Dyal" />
                        <Contributor src="https://picsum.photos/100" name="Solo Ibiki" />
                    </div>
                </div>
            </div>
            
            
        </div>
    );
}

export default LandingExample