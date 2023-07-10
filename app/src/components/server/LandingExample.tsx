import Image from "next/image";
import img from "../../../public/demo.png"
import MemberLink from "./MemberLink";

const LandingExample = () => {
    return (
        <div className="w-fit rounded-lg drop-shadow-[0_-20px_60px_rgba(140,128,253,0.15)]">

            <div className="h-[325px] md:h-[394px] w-[379px] md:w-[451px]">
                <div className="relative h-[220px] md:h-[300px] w-[220px] md:w-[300px]">
                    <Image className="rounded-lg select-none h-[220px] md:h-[300px] w-auto" src={img} alt="a demo image" />
                    <div className="bg-zinc-950 py-2 md:p-3 px-3 rounded-xl absolute top-[70%] left-[90%] border-[1px] border-stone-700">
                        <h3 className="text-stone-100 text-md md:text-lg font-barlow border-stone-700 border-b-2 mb-2 subpixel-antialiased">Contributors</h3>
                        <MemberLink src="https://picsum.photos/100" name="Ryan Mohamed" />
                        <MemberLink src="https://picsum.photos/100" name="Anybody" />
                        <MemberLink src="https://picsum.photos/100" name="Solo Ibiki" />
                    </div>
                </div>
            </div>
            
            
        </div>
    );
}

export default LandingExample