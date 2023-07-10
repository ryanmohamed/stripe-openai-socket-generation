import { UserData } from "@/context/SocketContext";
import Image from "next/image";
import SpinnerIcon from "../svg/SpinnerIcon";
import MemberLink from "./MemberLink";

interface ImageGenerationProps {
    src?: string,
    alt?: string,
    members: UserData[]
}

export default function ImageGeneration ({ src, alt, members }: ImageGenerationProps) {
    return (
        <div>
            <div className="w-fit rounded-lg drop-shadow-[0_-20px_60px_rgba(140,128,253,0.15)]">
                <div className="h-[325px] md:h-[394px] w-[379px] md:w-[451px]">
                    <div className="relative h-[220px] md:h-[300px] w-[220px] md:w-[300px]">
                        { src ? <Image className="rounded-lg select-none h-[220px] md:h-[300px] w-auto" src={src} alt="a demo image" fill /> : <div className="bg-indigo-50 animate-pulse rounded-lg select-none h-[220px] md:h-[300px] w-auto centered"><SpinnerIcon className="w-36 h-36 animate-spin" fill="#ead2fa" /></div>}
                        <div className="bg-zinc-950 py-2 md:p-3 px-3 rounded-xl absolute top-[70%] left-[90%] border-[1px] border-stone-700">
                            <h3 className="text-stone-100 text-md md:text-lg font-barlow border-stone-700 border-b-2 mb-2 subpixel-antialiased">Contributors</h3>
                            { members.map((member, idx) => (
                                <MemberLink src="https://picsum.photos/100" name="Ryan Mohamed" />
                            )) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}