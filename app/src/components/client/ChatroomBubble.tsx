import { useEffect, useState } from "react";
import MessageBubble from "../svg/MessageBubble";
import Chatroom from "./Chatroom";

export default function ChatroomBubble ({ show, setShow, className }: { show: boolean, setShow: any, className?: string }) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === 'Escape')
                setShow(false);
        }
        window.addEventListener("keydown", handleKeyDown);
        () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [])
    return (
        <>
            <div className={`transition z-[99] flex flex-col fixed bottom-[4rem] md:bottom-2 right-2 w-auto h-[50vh] aspect-[9/16] rounded-2xl overflow-hidden bg-stone-50 border-[3px] border-stone-500 ${ show ? "translate-x-[0]" : "translate-x-[150%]"}`}>
                <div className="h-[10%] p-4 flex items-center justify-between box-border border-b-[1px] border-stone-200 bg-stone-200">
                    <span className="text-xl text-stone-700 font-poppins font-semibold tracking-wide">Chatroom</span>
                    <button className="w-8 h-8 rounded-full relative" onClick={()=>setShow(false)}>
                        <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-6 h-2 bg-stone-700 rounded-2xl origin-center rotate-45"></div>
                        <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-6 h-2 bg-stone-700 rounded-2xl origin-center rotate-[-45deg]"></div>
                    </button>
                </div>
                <div className="h-[90%]">
                    <Chatroom />    
                </div>
            </div>
        </>
       
    );
}