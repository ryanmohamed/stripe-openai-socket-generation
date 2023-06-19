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
            <p className="mx-2 box-border bg-inherit min-h-[1.5rem] p-2 centered text-sm font-barlow rounded-2xl">{message}</p>
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
        <div className="col-span-8 row-start-3 flex flex-col justify-between align-center h-[80vh] md:h-full bg-black border-t-2 md:border-r-2 border-stone-800">
            <div className="p-4 max-h-full scroll-smooth msg-scroll no-scrollbar">
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
            
            <div className="py-4 centered">
                <form onSubmit={handleSendMessage} className="self-end flex-grow centered px-10">
                    <img className="w-10 h-10 rounded-full" src={session?.user?.image || "http://placeholder.co/500/500"} alt="user img" />
                    <input ref={ref} className="mx-4 flex-grow p-2 h-12 outline-none border-b-2 border-stone-800 bg-transparent font-poppins text-stone-300 transition" type="text" placeholder="Send a message..." />
                    <button className="h-10 p-3 centered rounded-lg font-bold text-stone-300 subpixel-antialiased bg-green-700 hover:bg-green-500 transition">Send</button>
                </form>
            </div>
        </div>
    );
}

export default Chatroom;