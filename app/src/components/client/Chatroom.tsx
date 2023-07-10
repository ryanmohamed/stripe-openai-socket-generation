import { MessageData } from "@/context/SocketContext";
import useRoomContext from "@/hooks/useRoomContext";
import useSocketContext from "@/hooks/useSocketContext";
import { useSession } from "next-auth/react";
import { FormEventHandler, useRef, useState } from "react";


const Message = ({ message, image, className }: {
    message: string,
    image: string, 
    className?: string
}) => {
    return (
        <li className={className}>
            <img className="w-10 h-10 rounded-full" src={image} alt="user image" />
            <p className="mx-2 min-w-[50px] box-border bg-inherit min-h-[1.5rem] p-2 centered text-sm font-barlow rounded-md">{message}</p>
        </li>
    );
}

const Chatroom = () => {
    const [ messageValue, setMessageValue ] = useState<string | null>(null);
    const ref = useRef<HTMLInputElement>(null);
    const lastRef = useRef<HTMLDivElement>(null);
    const { sendMessage, messages } = useRoomContext();
    const { socket } = useSocketContext();
    const { data: session } = useSession();

    const handleSendMessage: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const message = ref?.current?.value;
        if (message && message.length > 0) sendMessage && sendMessage(message);
        if (ref && ref.current) ref.current.value = "";
        setTimeout(() => {
            lastRef?.current?.scrollIntoView()
        }, 25);
    }
    return (
        <div className="h-full flex flex-col justify-between align-center box-border">
            
            <div className="p-4 overflow-scroll-y scroll-smooth msg-scroll no-scrollbar ">
                <ul className="flex flex-col w-full">
                    { messages?.map((msg: MessageData) => (
                        <Message 
                            message={msg.message} 
                            image={msg.sender.image} 
                            className={msg.sender.id === socket?.id ? "msg-to" : "msg-from"} 
                        />
                    )) }
                    <div ref={lastRef} ></div>
                </ul>
            </div>
            
            <div className="centered border-t-[1px] border-stone-200 bg-stone-200">
                <form onSubmit={handleSendMessage} className="self-end flex-grow flex-col p-2">
                    <div className="flex flex-row-reverse items-center justify-between w-full">
                        <img className="w-6 h-6 md:h-10 md:w-10 rounded-full" src={session?.user?.image || "http://placeholder.co/500/500"} alt="user img" />
                        <input ref={ref} className="mr-2 bg-white shadow-md shadow-stone-300 rounded-2xl flex-grow px-2 h-10 w-full outline-none font-barlow text-stone-800 transition hover:shadow-stone-400 cursor-pointer" type="text" placeholder="Send a message..." />
                    </div>
                    <button className="h-10 w-full mt-2 p-3 centered rounded-2xl font-bold text-stone-300 tracking-wide subpixel-antialiased bg-blue-700 hover:bg-blue-500 transition">Send</button>
                </form>
            </div>
        </div>
    );
}

export default Chatroom;